const buildPrompt = (selectedProduct, recommendations) => {
    return `
You are an AI Recommendation Engine.

Selected Product:
- Name: ${selectedProduct.productName}
- Category: ${selectedProduct.category}
- Brand: ${selectedProduct.brand}
- Price: ${selectedProduct.price}
- Rating: ${selectedProduct.rating}

Recommended Products:
${recommendations
        .map(
            (product, index) => `
${index + 1}.
Product ID: ${product._id}
Name: ${product.productName}
Category: ${product.category}
Brand: ${product.brand}
Price: ${product.price}
Rating: ${product.rating}
Score: ${product.score}
`
        )
        .join("\n")}

Return ONLY a valid JSON array.

Example:

[
  {
    "productId": "...",
    "reason": "..."
  },
  {
    "productId": "...",
    "reason": "..."
  }
]

Do not return markdown.
Do not return explanation.
Only return JSON.
`;
};

module.exports = {
    buildPrompt,
};