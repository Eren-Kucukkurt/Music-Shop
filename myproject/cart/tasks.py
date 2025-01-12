from django.core.mail import EmailMessage
from .utils import generate_invoice_pdf
import os
from background_task import background
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from .models import Refund


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
@background(schedule=1)
def send_refund_approval_email(refund_id):
    """
    Background task to send a refund approval email.
    """
    try:
        refund = Refund.objects.get(id=refund_id)
        user_email = refund.user.email

        # Email subject and context
        subject = f"Refund Approved - Order #{refund.order_item.order.id}"
        context = {
            'customer_name': f"{refund.user.profile.first_name} {refund.user.profile.last_name}",
            'product_name': refund.order_item.product_name,
            'order_id': refund.order_item.order.id,
            'requested_quantity': refund.requested_quantity,
            'refund_amount': f"${refund.refund_amount:.2f}",
        }

        # Render email templates
        text_content = render_to_string('emails/refund_approval.txt', context)
        html_content = render_to_string('emails/refund_approval.html', context)

        # Create and send the email
        email = EmailMultiAlternatives(
            subject,
            text_content,
            'musicshop308@gmail.com',
            [user_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    except Refund.DoesNotExist:
        print(f"Refund with ID {refund_id} not found.")