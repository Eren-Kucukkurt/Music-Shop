from django.test import TestCase
from django.contrib.auth.models import User
from cart.models import Cart

class CartModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_cart_creation_for_user(self):
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.user.username, 'testuser')
        self.assertIsNone(cart.session_id)  # Check session_id is None for authenticated users
        self.assertIsNotNone(cart.created_at)

    def test_cart_creation_for_guest(self):
        cart = Cart.objects.create(session_id='test-session-id')
        self.assertIsNone(cart.user)  # No user for guest cart
        self.assertEqual(cart.session_id, 'test-session-id')

    def test_cart_str_representation(self):
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(str(cart), 'Cart (testuser)')

        guest_cart = Cart.objects.create(session_id='guest-session')
        self.assertEqual(str(guest_cart), 'Cart (Guest)')

from store.models import Product
from cart.models import Cart, CartItem

class CartItemModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.cart = Cart.objects.create(user=self.user)
        self.product = Product.objects.create(
            name='Test Product',
            price=100.00,
            quantity_in_stock=10
        )

    def test_cart_item_creation(self):
        cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.assertEqual(cart_item.cart, self.cart)
        self.assertEqual(cart_item.product, self.product)
        self.assertEqual(cart_item.quantity, 2)

    def test_cart_item_total_price(self):
        cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)
        self.assertEqual(cart_item.total_price, 300.00)  # 3 * 100

    def test_cart_item_str_representation(self):
        cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.assertEqual(str(cart_item), '2 x Test Product')


from cart.models import Order
from datetime import timedelta
from django.utils.timezone import now

class OrderModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.order = Order.objects.create(user=self.user, total_price=500.00)

    def test_order_creation(self):
        self.assertEqual(self.order.user, self.user)
        self.assertEqual(self.order.total_price, 500.00)
        self.assertEqual(self.order.status, 'PROCESSING')
        self.assertIsNotNone(self.order.created_at)

    def test_order_update_status(self):
        # Initially PROCESSING
        self.assertEqual(self.order.status, 'PROCESSING')

        # Simulate time passage for status change to IN-TRANSIT
        self.order.last_status_change = now() - timedelta(seconds=61)
        self.order.update_status()
        self.assertEqual(self.order.status, 'IN-TRANSIT')

        # Simulate time passage for status change to DELIVERED
        self.order.last_status_change = now() - timedelta(seconds=11)
        self.order.update_status()
        self.assertEqual(self.order.status, 'DELIVERED')

    def test_order_str_representation(self):
        self.assertEqual(str(self.order), f"Order {self.order.id} - Processing")


from cart.models import Order, OrderItem

class OrderItemModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.product = Product.objects.create(
            name='Test Product',
            price=50.00,
            quantity_in_stock=20
        )
        self.order = Order.objects.create(user=self.user, total_price=100.00)

    def test_order_item_creation(self):
        order_item = OrderItem.objects.create(order=self.order, product=self.product, quantity=2, price=50.00)
        self.assertEqual(order_item.order, self.order)
        self.assertEqual(order_item.product, self.product)
        self.assertEqual(order_item.quantity, 2)
        self.assertEqual(order_item.price, 50.00)

    def test_order_item_str_representation(self):
        order_item = OrderItem.objects.create(order=self.order, product=self.product, quantity=2, price=50.00)
        self.assertEqual(str(order_item), f"2 x Test Product (Order {self.order.id})")


from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User


class TokenHeaderTests(APITestCase):
    def setUp(self):
        # Create a test user for authenticated requests
        self.user = User.objects.create_user(username='testuser', password='password123')
        
        # Generate access token for the test user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # Generate a guest token for unauthenticated requests
        self.guest_token = 'guest-' + self._generate_guest_token()

    def _generate_guest_token(self):
        import uuid
        return uuid.uuid4().hex  # Mimics the frontend guest token generation

    def get_headers(self, is_authenticated=True):
        """Helper function to generate request headers based on authentication state."""
        headers = {'Content-Type': 'application/json'}
        
        if is_authenticated:
            headers['Authorization'] = f'Bearer {self.access_token}'
        else:
            headers['Guest-Token'] = self.guest_token
        
        return headers

    def test_authenticated_request(self):
        """Example test case for an authenticated user."""
        headers = self.get_headers(is_authenticated=True)  # Authenticated headers
        response = self.client.get('/cart/', **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()})
        self.assertEqual(response.status_code, 200)

    def test_guest_request(self):
        """Example test case for a guest user."""
        # Create a guest cart in advance
        Cart.objects.create(session_id=self.guest_token)
        
        headers = self.get_headers(is_authenticated=False)  # Guest headers
        response = self.client.get('/cart/', **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()})
        self.assertEqual(response.status_code, 200)

    def test_add_item_to_cart_as_guest(self):
        """Test adding an item to the cart as a guest user."""
        headers = self.get_headers(is_authenticated=False)
        payload = {
            'product_id': 1,  # Assuming a product with ID 1 exists
            'quantity': 2
        }
        response = self.client.post('/cart/add_item/', payload, **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()})
        self.assertEqual(response.status_code, 200)



from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from cart.models import Cart, CartItem
from store.models import Product


class CartViewSetTest(APITestCase):
    def setUp(self):
        # Create a user for authenticated requests
        self.user = User.objects.create_user(username='testuser', password='password123')

        # Generate an access token for the user (authenticated)
        self.access_token = self._get_access_token()

        # Create a guest cart with a guest token
        self.guest_token = 'test-guest-session'
        self.guest_cart = Cart.objects.create(session_id=self.guest_token)

        # Create a product for cart operations
        self.product = Product.objects.create(
            name="Test Product",
            model = "Test Model",
            price=100.00,
            quantity_in_stock=10
        )

        # Create a cart item for the guest cart
        self.cart_item = CartItem.objects.create(
            cart=self.guest_cart,
            product=self.product,
            quantity=2
        )

    def _get_access_token(self):
        """Helper function to generate the access token for a test user."""
        response = self.client.post('/api/token/', {'username': 'testuser', 'password': 'password123'})
        return response.data['access']

    def get_headers(self, is_authenticated=True):
        """Helper function to create headers based on authentication state."""
        headers = {'Content-Type': 'application/json'}
        if is_authenticated:
            headers['Authorization'] = f'Bearer {self.access_token}'
        else:
            headers['Guest-Token'] = self.guest_token
        return headers

    def test_get_cart_for_guest(self):
        """Ensure a guest user can retrieve their cart using a session ID."""
        headers = self.get_headers(is_authenticated=False)  # Guest request
        response = self.client.get('/cart/', **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['product_name'], self.product.name)

    def test_add_item_to_cart(self):
        """Ensure a guest user can add an item to their cart."""
        headers = self.get_headers(is_authenticated=False)  # Guest request
        response = self.client.post(
            '/cart/add_item/',
            data={'product_id': self.product.id, 'quantity': 1},
            **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CartItem.objects.filter(cart=self.guest_cart).count(), 2)

    def test_remove_item_from_cart(self):
        """Ensure an item can be removed from the cart."""
        headers = self.get_headers(is_authenticated=False)  # Guest request
        response = self.client.post(
            f'/cart/{self.cart_item.id}/remove_item/',
            **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CartItem.objects.filter(cart=self.guest_cart).count(), 0)

    def test_get_cart_for_authenticated_user(self):
        """Ensure an authenticated user can retrieve their cart."""
        headers = self.get_headers(is_authenticated=True)  # Authenticated request
        self.client.login(username='testuser', password='password123')  # Ensure login
        response = self.client.get('/cart/', **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)  # New user cart is empty

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from store.models import Product


class OrderViewSetTest(APITestCase):
    def setUp(self):
        # Create a user for authenticated requests
        self.user = User.objects.create_user(username='testuser', password='password123')

        # Generate an access token for the user (authenticated)
        self.access_token = self._get_access_token()

        # Create a product for order operations
        self.product = Product.objects.create(
            name="Order Product",
            price=50.00,
            quantity_in_stock=5
        )

        # Create an order for the user
        self.order = Order.objects.create(
            user=self.user,
            total_price=100.00,
            status="PROCESSING"
        )

        # Create an order item for the order
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=50.00
        )

    def _get_access_token(self):
        """Helper function to generate the access token for a test user."""
        response = self.client.post('/api/token/', {'username': 'testuser', 'password': 'password123'})
        return response.data['access']

    def get_headers(self, is_authenticated=True):
        """Helper function to create headers based on authentication state."""
        headers = {'Content-Type': 'application/json'}
        if is_authenticated:
            headers['Authorization'] = f'Bearer {self.access_token}'
        return headers

    def test_get_latest_order(self):
        """Ensure a user can retrieve their latest order."""
        headers = self.get_headers(is_authenticated=True)  # Authenticated request
        response = self.client.get('/orders/latest/', **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.order.id)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['product_name'], self.product.name)

    def test_create_order(self):
        """Ensure a user can create an order."""
        headers = self.get_headers(is_authenticated=True)  # Authenticated request
        response = self.client.post(
            '/orders/',
            data={
                'items': [
                    {'product_id': self.product.id, 'quantity': 1, 'price': 50.00}
                ],
                'total_price': 50.00,
                'status': 'PROCESSING'
            },
            **{'HTTP_' + k.upper().replace('-', '_'): v for k, v in headers.items()},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 2)  # New order created



from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User


class UserAuthTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='password123', email='testuser@example.com')

    def test_user_login_success(self):
        """Ensure a user can log in with valid credentials."""
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'password123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)  # Check if access token is returned
        self.assertIn('refresh', response.data)  # Check if refresh token is returned

    def test_user_login_failure(self):
        """Ensure login fails with invalid credentials."""
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)  # Check for error message

    def test_user_registration_success(self):
        """Ensure a new user can register."""
        response = self.client.post('/api/register/', {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'newuser@example.com',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'User created successfully!')

    def test_user_registration_failure(self):
        """Ensure registration fails with invalid data."""
        response = self.client.post('/api/register/', {
            'username': '',  # Missing username
            'password': 'short',
            'email': 'invalidemail',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)  # Check for field-specific errors
        self.assertIn('email', response.data)
