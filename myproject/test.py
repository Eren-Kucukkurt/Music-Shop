import unittest
from django.test import TestCase, Client
from django.contrib.auth.models import User
from store.models import Product, Category, Review, Purchase, Wishlist
from cart.models import Cart, CartItem, Order, OrderItem, Refund
from users.models import Profile, CreditCard
from decimal import Decimal
from django.utils import timezone
import json

class MusicStoreTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        
        # Create test category
        self.category = Category.objects.create(name='Guitars')
        
        # Create test product
        self.product = Product.objects.create(
            name='Test Guitar',
            category=self.category,
            model='TG-100',
            price=Decimal('999.99'),
            cost=Decimal('599.99'),
            quantity_in_stock=10
        )
        
        self.client = Client()

    def test_01_product_creation(self):
        """Test that a product can be created with correct attributes"""
        self.assertEqual(self.product.name, 'Test Guitar')
        self.assertEqual(self.product.quantity_in_stock, 10)
        self.assertEqual(self.product.price, Decimal('999.99'))

    def test_02_product_stock_update(self):
        """Test product stock quantity updates correctly"""
        initial_stock = self.product.quantity_in_stock
        self.product.quantity_in_stock -= 2
        self.product.save()
        self.assertEqual(self.product.quantity_in_stock, initial_stock - 2)

    def test_03_category_creation(self):
        """Test category creation and product association"""
        product_count = self.category.products.count()
        self.assertEqual(product_count, 1)
        self.assertEqual(self.category.name, 'Guitars')

    def test_04_user_profile_creation(self):
        """Test user profile is created automatically"""
        self.assertTrue(hasattr(self.user, 'profile'))
        self.assertEqual(self.user.profile.role, 'CUSTOMER')

    def test_05_cart_creation(self):
        """Test cart creation for user"""
        cart = Cart.objects.create(user=self.user)
        self.assertIsNotNone(cart)
        self.assertEqual(cart.user, self.user)

    def test_06_add_to_cart(self):
        """Test adding item to cart"""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1
        )
        self.assertEqual(cart.items.count(), 1)
        self.assertEqual(cart_item.quantity, 1)

    def test_07_wishlist_creation(self):
        """Test wishlist creation and product addition"""
        wishlist = Wishlist.objects.create(user=self.user)
        wishlist.products.add(self.product)
        self.assertEqual(wishlist.products.count(), 1)

    def test_08_product_discount_calculation(self):
        """Test product discount calculation"""
        self.product.discount_percentage = Decimal('20.00')
        self.product.is_discount_active = True
        self.product.save()
        expected_price = Decimal('799.99')  # 20% off 999.99
        self.assertAlmostEqual(self.product.get_discounted_price(), expected_price, places=2)

    def test_09_review_creation(self):
        """Test review creation and approval"""
        review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            comment="Great product!",
            is_approved=False
        )
        self.assertEqual(review.rating, 5)
        self.assertFalse(review.is_approved)

    def test_10_order_creation(self):
        """Test order creation and status"""
        order = Order.objects.create(
            user=self.user,
            total_price=Decimal('999.99'),
            status='PROCESSING'
        )
        self.assertEqual(order.status, 'PROCESSING')
        self.assertEqual(order.user, self.user)

    def test_11_order_item_creation(self):
        """Test order item creation and association"""
        order = Order.objects.create(
            user=self.user,
            total_price=Decimal('999.99')
        )
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            price=self.product.price
        )
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order_item.quantity, 1)

    def test_12_purchase_tracking(self):
        """Test purchase creation and product association"""
        purchase = Purchase.objects.create(
            user=self.user,
            product=self.product,
            quantity=1
        )
        self.assertEqual(purchase.quantity, 1)
        self.assertEqual(purchase.user, self.user)

    def test_13_credit_card_encryption(self):
        """Test credit card information encryption"""
        card = CreditCard.objects.create(
            user=self.user,
            card_name="Test Card",
            encrypted_card_number="1234567890123456",
            encrypted_expiry_date="12/25",
            encrypted_cvv="123"
        )
        self.assertNotEqual(card.encrypted_card_number, "1234567890123456")
        self.assertTrue(hasattr(card, 'last4'))

    def test_14_refund_request(self):
        """Test refund request creation and processing"""
        order = Order.objects.create(user=self.user, total_price=Decimal('999.99'))
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            price=self.product.price
        )
        refund = Refund.objects.create(
            order_item=order_item,
            user=self.user,
            requested_quantity=1,
            status='PENDING'
        )
        self.assertEqual(refund.status, 'PENDING')
        self.assertEqual(refund.requested_quantity, 1)

    def test_15_product_search(self):
        """Test product search functionality"""
        response = self.client.get('/api/products/', {'search': 'Guitar'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)

    def test_16_order_cancellation(self):
        """Test order cancellation"""
        order = Order.objects.create(
            user=self.user,
            status='PROCESSING',
            total_price=Decimal('999.99')
        )
        order.cancel_order()
        self.assertEqual(order.status, 'CANCELED')

    def test_17_product_rating_update(self):
        """Test product rating calculation"""
        Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            is_approved=True
        )
        Review.objects.create(
            product=self.product,
            user=self.user,
            rating=4,
            is_approved=True
        )
        self.product.save()  # This triggers rating update
        self.assertEqual(self.product.rating, Decimal('4.50'))

    def test_18_cart_merge(self):
        """Test merging guest cart with user cart"""
        guest_cart = Cart.objects.create(session_id='test_session')
        user_cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=guest_cart, product=self.product, quantity=2)
        CartItem.objects.create(cart=user_cart, product=self.product, quantity=1)
        
        # Simulate cart merge
        guest_items = guest_cart.items.all()
        for item in guest_items:
            CartItem.objects.create(cart=user_cart, product=item.product, quantity=item.quantity)
        
        self.assertEqual(user_cart.items.count(), 2)

    def test_19_order_status_update(self):
        """Test order status progression"""
        order = Order.objects.create(
            user=self.user,
            status='PROCESSING',
            total_price=Decimal('999.99')
        )
        order.update_status()
        self.assertEqual(order.status, 'IN-TRANSIT')

    def test_20_stock_validation(self):
        """Test stock validation when adding to cart"""
        cart = Cart.objects.create(user=self.user)
        self.product.quantity_in_stock = 5
        self.product.save()
        
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=6)
        self.assertLess(cart_item.quantity, self.product.quantity_in_stock)

    def test_21_refund_approval(self):
        """Test refund approval process"""
        order = Order.objects.create(user=self.user, total_price=Decimal('999.99'))
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
        refund = Refund.objects.create(
            order_item=order_item,
            user=self.user,
            requested_quantity=1,
            status='PENDING'
        )
        initial_stock = self.product.quantity_in_stock
        refund.approve()
        self.product.refresh_from_db()
        self.assertEqual(refund.status, 'APPROVED')
        self.assertEqual(self.product.quantity_in_stock, initial_stock + 1)

    def test_22_review_approval(self):
        """Test review approval process"""
        review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=4,
            comment="Good product",
            is_approved=False
        )
        review.is_approved = True
        review.save()
        self.assertTrue(review.is_approved)

    def test_23_product_popularity(self):
        """Test product popularity calculation"""
        initial_popularity = self.product.popularity
        Purchase.objects.create(user=self.user, product=self.product, quantity=5)
        self.product.refresh_from_db()
        self.assertGreater(self.product.popularity, initial_popularity)

    def test_24_order_total_calculation(self):
        """Test order total price calculation"""
        order = Order.objects.create(user=self.user)
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
        expected_total = self.product.price * 2
        self.assertEqual(order.total_price, expected_total)

    def test_25_product_availability(self):
        """Test product availability status"""
        self.product.quantity_in_stock = 0
        self.product.save()
        cart = Cart.objects.create(user=self.user)
        with self.assertRaises(Exception):
            CartItem.objects.create(cart=cart, product=self.product, quantity=1)

    def test_26_wishlist_to_cart(self):
        """Test moving product from wishlist to cart"""
        wishlist = Wishlist.objects.create(user=self.user)
        wishlist.products.add(self.product)
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        self.assertEqual(cart.items.count(), 1)

    def test_27_refund_calculation(self):
        """Test refund amount calculation"""
        order = Order.objects.create(user=self.user, total_price=Decimal('999.99'))
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=2,
            price=Decimal('999.99')
        )
        refund = Refund.objects.create(
            order_item=order_item,
            user=self.user,
            requested_quantity=1
        )
        expected_refund = Decimal('999.99')
        self.assertEqual(refund.calculate_refund_amount(), expected_refund)

    def test_28_profile_role_validation(self):
        """Test profile role validation"""
        profile = self.user.profile
        with self.assertRaises(Exception):
            profile.role = 'INVALID_ROLE'
            profile.save()

    def test_29_order_item_refund_validation(self):
        """Test order item refund quantity validation"""
        order = Order.objects.create(user=self.user, total_price=Decimal('999.99'))
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            price=self.product.price
        )
        self.assertEqual(order_item.refundable_quantity(), 1)
        order_item.refunded_quantity = 1
        order_item.save()
        self.assertEqual(order_item.refundable_quantity(), 0)

    def test_30_credit_card_validation(self):
        """Test credit card validation"""
        with self.assertRaises(Exception):
            CreditCard.objects.create(
                user=self.user,
                card_name="Test Card",
                encrypted_card_number="invalid",
                encrypted_expiry_date="invalid",
                encrypted_cvv="invalid"
            )