import streamlit as st
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import re
from urllib.parse import urljoin, urlparse
import json
import random
import os
import hashlib

# Global currency symbols dictionary
CURRENCY_SYMBOLS = {
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
}

def get_preview_id():
    """Generate a unique preview ID"""
    return hashlib.md5(str(random.randint(0, 1000000)).encode()).hexdigest()[:8]

def save_preview(content):
    """Save preview content to a file"""
    preview_id = get_preview_id()
    os.makedirs('webpages/previews', exist_ok=True)
    
    preview_path = os.path.join('webpages/previews', f'{preview_id}.html')
    with open(preview_path, 'w') as f:
        f.write(content)
    
    return preview_id

def load_preview(preview_id):
    """Load preview content from a file"""
    try:
        preview_path = os.path.join('webpages/previews', f'{preview_id}.html')
        with open(preview_path, 'r') as f:
            return f.read()
    except:
        return None

def clean_url(url):
    """Remove protocol and trailing slash from URL"""
    url = re.sub(r'https?://', '', url)
    return url.rstrip('/')

def get_store_name(url):
    """Extract store name from the website"""
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try different methods to find the store name
        # Method 1: Look for shop name in title
        title = soup.title.string if soup.title else None
        if title:
            # Remove common suffixes from title
            title = re.sub(r'\s*[|•-]\s*.*$', '', title).strip()
            return title
            
        # Method 2: Look for store name in header
        header_text = soup.find('h1', {'class': re.compile('(header|brand|logo|site-title)', re.I)})
        if header_text:
            return header_text.get_text().strip()
            
        # Method 3: Look for store name in meta tags
        meta_title = soup.find('meta', {'property': 'og:site_name'})
        if meta_title:
            return meta_title.get('content', '').strip()
            
    except Exception as e:
        st.error(f"Error fetching store name: {str(e)}")
    return None

def format_url(url):
    """Add protocol if missing and ensure URL is properly formatted"""
    if not url:
        return url
    # Remove any whitespace
    url = url.strip()
    # Add https:// if no protocol specified
    if not re.match(r'^https?://', url):
        url = 'https://' + url
    return url

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.netloc])  # Only check if there's a domain
    except:
        return False

def get_logo_url(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try different methods to find the logo
        # Method 1: Look for logo in common image elements
        logo_candidates = soup.find_all('img', {'src': re.compile('logo', re.I)})
        
        # Method 2: Look for logo in common class names
        if not logo_candidates:
            logo_candidates = soup.find_all('img', {'class': re.compile('logo', re.I)})
        
        # Method 3: Look for logo in common id names
        if not logo_candidates:
            logo_candidates = soup.find_all('img', {'id': re.compile('logo', re.I)})
        
        if logo_candidates:
            logo_src = logo_candidates[0].get('src')
            if logo_src:
                return urljoin(url, logo_src)
    except Exception as e:
        st.error(f"Error fetching logo: {str(e)}")
    return None

def format_price(price, currency):
    """Format price with appropriate currency symbol"""
    symbol = CURRENCY_SYMBOLS.get(currency, currency + ' ')
    return f"{symbol}{float(price):.2f}"

def get_products(url, is_origin=False, currency='USD'):
    """Fetch products from a Shopify store
    Args:
        url: Store URL
        is_origin: Whether this is the origin store
        currency: Currency to use for price formatting (default: USD)
    """
    products = []
    try:
        # Ensure the URL ends with /products.json
        if not url.endswith('/products.json'):
            base_url = url.rstrip('/')
            url = f"{base_url}/products.json"
        
        # Try the original URL first
        response = requests.get(url)
        
        # If that fails, try the myshopify.com version
        if response.status_code != 200:
            # Extract domain from URL
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.split(':')[0]  # Remove port if present
            
            # Remove any existing .myshopify.com
            domain = domain.replace('.myshopify.com', '')
            
            # Remove www. if present
            if domain.startswith('www.'):
                domain = domain[4:]
            
            # Extract the main domain name (remove TLD)
            domain_parts = domain.split('.')
            if len(domain_parts) > 1:
                domain = domain_parts[0]  # Take just the first part before any dots
            
            # Create myshopify URL
            myshopify_url = f"https://{domain}.myshopify.com/products.json"
            st.info(f"Trying alternate URL: {myshopify_url}")  # Debug info
            response = requests.get(myshopify_url)
            
            if response.status_code != 200:
                st.error("Please provide a valid Shopify store URL. The URL should be from a Shopify store.")
                return products
            
        try:
            data = response.json()
        except json.JSONDecodeError:
            st.error("The provided URL does not appear to be a Shopify store.")
            return products
        
        # For origin store, return a random product
        if is_origin and data.get('products'):
            product = random.choice(data['products'])
            variant = product['variants'][0] if product.get('variants') else None
            if variant:
                return {
                    'name': product.get('title', ''),
                    'price': format_price(variant['price'], currency) if variant.get('price') else 'N/A',
                    'image': product['images'][0]['src'] if product.get('images') else None,
                    'variant_id': variant['id'],
                    'currency': currency
                }
            return None
        
        # For destination store, process up to 5 products
        for product in data.get('products', [])[:5]:
            variant = product['variants'][0] if product.get('variants') else None
            if variant:
                product_info = {
                    'name': product.get('title', ''),
                    'price': format_price(variant['price'], currency) if variant.get('price') else 'N/A',
                    'image': product['images'][0]['src'] if product.get('images') else None,
                    'variant_id': variant['id'],
                    'currency': currency
                }
                
                if all(product_info.values()):
                    products.append(product_info)
                
    except Exception as e:
        st.error(f"Error fetching products: {str(e)}")
    
    return products

def render_thank_you_page(template_path, context):
    try:
        with open(template_path, 'r') as file:
            template_content = file.read()
            
        # Replace all template tags with their values
        for key, value in context.items():
            template_content = template_content.replace('{{' + key + '}}', str(value))
            
        return template_content
    except Exception as e:
        st.error(f"Error rendering template: {str(e)}")
        return None

def main():
    st.set_page_config(layout="wide")
    st.title("Store Product Viewer")
    
    # Input fields for URLs
    origin_url = st.text_input("Enter Origin Store URL:")
    destination_url = st.text_input("Enter Destination Store URL (Shopify store URL):")
    
    # Format URLs
    origin_url = format_url(origin_url)
    destination_url = format_url(destination_url)
    
    # Available currencies
    currencies = {
        'USD': 'US Dollar ($)',
        'GBP': 'British Pound (£)',
        'EUR': 'Euro (€)',
        'JPY': 'Japanese Yen (¥)',
        'AUD': 'Australian Dollar (A$)',
        'CAD': 'Canadian Dollar (C$)'
    }
    
    # Currency selection
    col1, col2 = st.columns(2)
    with col1:
        origin_currency = st.selectbox(
            "Origin Store Currency",
            options=list(currencies.keys()),
            format_func=lambda x: currencies[x],
            index=0
        )
    with col2:
        destination_currency = st.selectbox(
            "Destination Store Currency",
            options=list(currencies.keys()),
            format_func=lambda x: currencies[x],
            index=0
        )
    
    # Input fields for collaboration text and discount
    col1, col2, col3 = st.columns(3)
    with col1:
        collaboration_headline = st.text_input(
            "Collaboration Headline",
            value="You might also like..."
        )
    with col2:
        collaboration_subheadline = st.text_input(
            "Collaboration Subheadline",
            value="Discover more amazing products from our partner brand that we love and trust."
        )
    with col3:
        discount_percentage = st.number_input(
            "Discount Percentage",
            min_value=0,
            max_value=100,
            value=20,
            step=5,
            help="Enter the discount percentage to apply to products"
        )
    
    if st.button("Generate Demo"):
        if not origin_url or not destination_url:
            st.error("Please enter both URLs")
            return
            
        if not is_valid_url(origin_url) or not is_valid_url(destination_url):
            st.error("Please enter valid URLs")
            return
            
        with st.spinner("Generating thank you page..."):
            # Get logo from origin store
            logo_url = get_logo_url(origin_url)
            store_name = None
            is_text_logo = False
            
            # If no logo found, try to get store name
            if not logo_url:
                store_name = get_store_name(origin_url)
                if not store_name:
                    st.error("Could not find logo or store name in origin store")
                    return
                is_text_logo = True
            
            # Get random product from origin store
            origin_product = get_products(origin_url, is_origin=True, currency=origin_currency)
            if not origin_product:
                st.error("Could not fetch products from origin store")
                return
                
            # Get products from destination store
            destination_products = get_products(destination_url, currency=destination_currency)
            if len(destination_products) < 5:
                st.error("Could not fetch enough products from destination store")
                return
                
            # Clean URLs for template
            clean_origin_url = clean_url(origin_url)
            clean_destination_url = clean_url(destination_url)
            
            # Update collaboration subheadline with discount info
            if discount_percentage > 0:
                collaboration_subheadline = f"{collaboration_subheadline} Plus, enjoy {discount_percentage}% off on all products!"
                
            # Prepare context for template
            context = {
                'origin_store_url': clean_origin_url,
                'origin_brand_logo_html': f'<img src="{logo_url}" alt="Store Logo" height="40px" />' if logo_url else f'<h1 style="margin: 0; font-size: 24px;">{store_name}</h1>',
                'origin_product_price': origin_product['price'],
                'origin_product_image_url': origin_product['image'],
                'origin_product_name': origin_product['name'],
                'collaboration_headline': collaboration_headline,
                'collaboration_subheadline': collaboration_subheadline,
                'destination_store_url': clean_destination_url,
            }
            
            # Add destination products to context with discounted prices
            for i, product in enumerate(destination_products[:5], 1):
                currency = product['currency']
                original_price = float(product['price'].replace(CURRENCY_SYMBOLS.get(currency, currency + ' '), ''))
                discounted_price = original_price * (1 - discount_percentage / 100)
                
                price_display = product['price'] if discount_percentage == 0 else f'<span style="text-decoration: line-through">{format_price(original_price, currency)}</span> <span style="color: #ff0000">{format_price(discounted_price, currency)}</span>'
                
                context[f'destination_store_product_{i}_image'] = product['image']
                context[f'destination_store_product_{i}_title'] = product['name']
                context[f'destination_store_product_{i}_price'] = price_display
                context[f'destination_store_product_{i}_variant_id'] = product['variant_id']
            
            # Render template
            template_path = os.path.join('webpages', 'thankyou.html')
            rendered_page = render_thank_you_page(template_path, context)
            
            if rendered_page:
                # Show preview in the current page
                st.subheader("Preview:")
                st.components.v1.html(rendered_page, height=800, scrolling=True)
            else:
                st.error("Failed to render thank you page")

if __name__ == "__main__":
    main() 