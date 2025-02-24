# Store Product Viewer

A Streamlit application that allows you to:

1. Extract a logo from an origin store's website
2. Fetch and display products from a destination store's website

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the Streamlit app:

```bash
streamlit run app.py
```

## Usage

1. Enter the URL of the origin store (the store whose logo you want to display)
2. Enter the URL of the destination store (the store whose products you want to display)
3. The app will automatically fetch and display:
   - The logo from the origin store
   - A grid of products from the destination store, including:
     - Product images
     - Product names
     - Product prices

## Notes

- The app attempts to find logos and products using common HTML patterns
- Product display is limited to 12 items to ensure reasonable performance
- Make sure to enter valid URLs including the protocol (http:// or https://)
