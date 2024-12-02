from xhtml2pdf import pisa
import tempfile

def generate_invoice_pdf(order):
    """
    Generate a PDF invoice for the given order using xhtml2pdf.
    """
    # Fetch the related order items
    order_items = order.items.all()  # Use the related_name 'items'

    # Render the invoice HTML as a string
    from django.template.loader import render_to_string
    html_string = render_to_string('cart/invoice_template.html', {
        'order': order,
        'order_items': order_items
    })

    # Save the PDF to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_invoice_{order.id}.pdf") as temp_file:
        with open(temp_file.name, "w+b") as result_file:
            pisa_status = pisa.CreatePDF(html_string, dest=result_file)
        if pisa_status.err:
            raise Exception(f"Error generating PDF: {pisa_status.err}")

    return temp_file.name
