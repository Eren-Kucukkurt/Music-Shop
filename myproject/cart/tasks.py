from django.core.mail import EmailMessage
from .utils import generate_invoice_pdf
import os
from background_task import background

@background(schedule=1)
def send_order_confirmation_email(user_email, order_id):
    """
    Background task to send order confirmation email with PDF invoice.
    """
    from .models import Order  # Import Order model
    order = Order.objects.get(id=order_id)

    # Generate the invoice PDF
    pdf_path = generate_invoice_pdf(order)

    # Create and send the email
    subject = f"Order Confirmation - Invoice #{order.id}"
    message = f"Thank you for your order! Attached is your invoice.\n\nOrder ID: {order.id}"
    email = EmailMessage(subject, message, 'musicshop308@gmail.com', [user_email])
    with open(pdf_path, "rb") as pdf_file:
        email.attach(f"invoice_{order.id}.pdf", pdf_file.read(), "application/pdf")
    email.send()

    # Clean up the temporary PDF file
    os.remove(pdf_path)
