from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('products', views.ProductViewSet, basename='product')
router.register('categories', views.CategoryViewSet, basename='category')

urlpatterns = [
    # API Routes
    path('', include(router.urls)),
    
    # Cart Routes
    path('cart/', views.get_cart, name='get_cart'),
    path('cart/add/', views.add_to_cart, name='add_to_cart'),
    path('cart/update/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    
    # Order Routes
    path('orders/', views.get_orders, name='get_orders'),
    path('orders/<int:order_id>/', views.get_order_detail, name='get_order_detail'),
    path('orders/create/', views.create_order, name='create_order'),
    
    # Auth Routes
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/logout/', views.logout_user, name='logout_user'),
]