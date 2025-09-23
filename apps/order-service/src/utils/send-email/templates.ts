export const orderInlineTemplates: Record<string, string> = {
  'order-confirmation': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation - Your Order Has Been Confirmed!</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Arial', sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 300;
      }
      .content {
        padding: 40px 30px;
        line-height: 1.6;
      }
      .welcome-text {
        font-size: 18px;
        margin-bottom: 20px;
        color: #555;
      }
      .order-summary {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 30px;
        margin: 30px 0;
        border-left: 4px solid #28a745;
      }
      .order-summary h3 {
        margin-top: 0;
        color: #28a745;
        font-size: 18px;
        margin-bottom: 20px;
      }
      .total-amount {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 6px;
        padding: 20px;
        text-align: center;
        margin: 20px 0;
      }
      .total-label {
        font-size: 14px;
        color: #155724;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .total-value {
        font-size: 32px;
        font-weight: bold;
        color: #28a745;
        margin: 15px 0;
      }
      .cart-items {
        margin: 25px 0;
      }
      .cart-item {
        background-color: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 15px;
        margin: 10px 0;
        display: flex;
        align-items: center;
      }
      .item-image {
        width: 60px;
        height: 60px;
        background-color: #f8f9fa;
        border-radius: 4px;
        margin-right: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 12px;
      }
      .item-details {
        flex: 1;
      }
      .item-name {
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      .item-price {
        color: #28a745;
        font-weight: bold;
      }
      .item-quantity {
        color: #6c757d;
        font-size: 14px;
      }
      .tracking-section {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 6px;
        padding: 20px;
        margin: 25px 0;
        text-align: center;
      }
      .tracking-section h3 {
        margin-top: 0;
        color: #856404;
        font-size: 16px;
      }
      .tracking-button {
        display: inline-block;
        background-color: #28a745;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin: 15px 0;
        transition: background-color 0.3s;
      }
      .tracking-button:hover {
        background-color: #218838;
      }
      .next-steps {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        border-radius: 6px;
        padding: 20px;
        margin: 25px 0;
      }
      .next-steps h3 {
        margin-top: 0;
        color: #0c5460;
        font-size: 16px;
      }
      .next-steps ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      .next-steps li {
        margin: 5px 0;
        color: #0c5460;
      }
      .footer {
        background-color: #f8f9fa;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #dee2e6;
      }
      .footer p {
        margin: 5px 0;
        color: #666;
        font-size: 14px;
      }
      .footer a {
        color: #28a745;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      .brand-logo {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .order-number {
        background-color: #e9ecef;
        border-radius: 4px;
        padding: 8px 12px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #495057;
        display: inline-block;
        margin: 10px 0;
      }
      @media (max-width: 600px) {
        .container {
          margin: 0 10px;
        }
        .header,
        .content,
        .footer {
          padding: 20px;
        }
        .cart-item {
          flex-direction: column;
          text-align: center;
        }
        .item-image {
          margin-right: 0;
          margin-bottom: 10px;
        }
        .total-value {
          font-size: 28px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand-logo">NextCart</div>
        <h1>Order Confirmed!</h1>
      </div>

      <div class="content">
        <p class="welcome-text">Hello <strong><%= name %></strong>,</p>

        <p>
          Thank you for your order! We're excited to let you know that your order has been successfully placed and
          confirmed. We're working hard to get your items ready for shipping.
        </p>

        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="order-number">Order ID: <%= sessionId || 'N/A' %></div>

          <div class="cart-items">
            <% if (cart && cart.length > 0) { %> <% cart.forEach(function(item) { %>
            <div class="cart-item">
              <div class="item-image">
                <% if (item.image) { %>
                <img
                  src="<%= item.image %>"
                  alt="<%= item.name %>"
                  style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px"
                />
                <% } else { %> IMG <% } %>
              </div>
              <div class="item-details">
                <div class="item-name"><%= item.name || 'Product' %></div>
                <div class="item-price">$<%= (item.sale_price || 0).toFixed(2) %></div>
                <div class="item-quantity">Quantity: <%= item.quantity || 1 %></div>
              </div>
            </div>
            <% }); %> <% } else { %>
            <p>Order items will be displayed here</p>
            <% } %>
          </div>

          <div class="total-amount">
            <div class="total-label">Total Amount</div>
            <div class="total-value">$<%= (totalAmount || 0).toFixed(2) %></div>
          </div>
        </div>

        <div class="tracking-section">
          <h3>Track Your Order</h3>
          <p>Stay updated on your order status and delivery progress</p>
          <a href="<%= trackingUrl %>" class="tracking-button">Track Order</a>
        </div>

        <div class="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>We'll process your order and prepare it for shipping</li>
            <li>You'll receive shipping confirmation with tracking details</li>
            <li>Your order will be delivered to your specified address</li>
            <li>You can track your order status anytime using the link above</li>
          </ul>
        </div>

        <p>
          If you have any questions about your order or need to make changes, please don't hesitate to contact our
          customer support team. We're here to help ensure you have a great shopping experience!
        </p>
      </div>

      <div class="footer">
        <p><strong>NextCart Customer Support</strong></p>
        <p>Email: <a href="mailto:support@nextcart.com">support@nextcart.com</a></p>
        <p>Phone: 1-800-NextCart</p>
        <p style="margin-top: 20px; font-size: 12px">
          This email confirms your recent order placement.
          <br />© 2025 NextCart. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
`,
};

export const getOrderInlineTemplate = (templateName: string): string | undefined =>
  orderInlineTemplates[templateName];
