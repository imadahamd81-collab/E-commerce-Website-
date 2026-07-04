from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
import uuid

from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, UserSerializer, UserRegisterSerializer
)

# ============================================
# PRODUCT VIEWS
# ============================================

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        featured = self.request.query_params.get('featured')
        
        if category:
            queryset = queryset.filter(category__slug=category)
        if search:
            queryset = queryset.filter(name__icontains=search)
        if featured:
            queryset = queryset.filter(featured=True)
        
        return queryset

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# ============================================
# CART VIEWS
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not created:
        cart_item.quantity += int(quantity)
    else:
        cart_item.quantity = int(quantity)
    
    cart_item.save()
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user, cart__is_active=True)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    
    quantity = request.data.get('quantity')
    if quantity is not None:
        if int(quantity) <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = int(quantity)
            cart_item.save()
    
    cart = cart_item.cart
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user, cart__is_active=True)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    
    cart_item.delete()
    cart = cart_item.cart
    serializer = CartSerializer(cart)
    return Response(serializer.data)

# ============================================
# ORDER VIEWS
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    cart = Cart.objects.filter(user=request.user, is_active=True).first()
    if not cart or not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    data = request.data
    
    with transaction.atomic():
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            country=data.get('country', 'India'),
            total_amount=cart.get_total(),
            payment_method=data.get('payment_method', 'COD')
        )
        
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            
            product = cart_item.product
            product.stock -= cart_item.quantity
            product.save()
        
        cart.is_active = False
        cart.save()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = OrderSerializer(order)
    return Response(serializer.data)

# ============================================
# AUTH VIEWS
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    from django.contrib.auth import authenticate
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)