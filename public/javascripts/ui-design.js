// price range slider

let minValue = document.getElementById("min-value");
let maxValue = document.getElementById("max-value");

const rangeFill = document.querySelector(".range-fill");

// Select the input elements with the classes "min-price" and "max-price"
const inputElements = document.querySelectorAll(".min-price, .max-price");

// Function to validate range and update the fill color on slider
function validateRange() {
  let minPrice = parseInt(inputElements[0].value);
  let maxPrice = parseInt(inputElements[1].value);

  if (minPrice > maxPrice) {
    let tempValue = maxPrice;
    maxPrice = minPrice;
    minPrice = tempValue;
  }

  const minPercentage = ((minPrice - 100) / 49900) * 100; // Updated to match the new min and max values
  const maxPercentage = ((maxPrice - 100) / 49900) * 100; // Updated to match the new min and max values

  rangeFill.style.left = minPercentage + "%";
  rangeFill.style.width = maxPercentage - minPercentage + "%";

  minValue.innerHTML = "₹" + minPrice;
  maxValue.innerHTML = "₹" + maxPrice;

  sendDataToServer(minPrice,maxPrice)
}

// Add an event listener to each input element
inputElements.forEach((element) => {
  element.addEventListener("input", validateRange);
});

// Initial call to validateRange
validateRange();
// price range slider

function sendDataToServer(minPrice,maxPrice){
    const data = {
      minPrice:minPrice,
      maxPrice:maxPrice
    }



    $.ajax({
      url:'/priceRange',
      method:'POST',
      data:data,
      success: function(response){

       updateFilterProduct(response.productInRange || response.filterWithPriceRange)
 
      }

    })
}

function updateFilterProduct(products){

  if(products.length >0){

 
  $('#product-list').empty();

  products.forEach(function (product) {
    var productHtml = `
        <div class="col-6 col-md-4 col-lg-4 col-xl-3 col-xxl-2">
            <div class="product">
                <figure class="product-media">
                ${product.ProductCount === 0 ? '<span class="product-label label-out">Out of stock</span>' : ''}
                    <a href="./productView?id=${product._id}">
                        <img src="${product.images[0]}" alt="Product image" class="product-image">
                    </a>

                    <div class="product-action-vertical">
                        <a href="#" class="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                    </div><!-- End .product-action -->

                    <div class="product-action action-icon-top">
                        <a href="#" class="btn-product btn-cart"><span>add to cart</span></a>
                    </div><!-- End .product-action -->
                </figure><!-- End .product-media -->

                <div class="product-body">
                    <div class="product-cat">
                        <a href="#">${product.Catagory}</a>
                    </div><!-- End .product-cat -->
                    <h3 class="product-title"><a href="product.html">${product.ProductName}</a></h3><!-- End .product-title -->
                    <div class="product-price">
                        ₹${product.ProductPrice}
                    </div><!-- End .product-price -->
                   
                </div><!-- End .product-body -->
            </div><!-- End .product -->
        </div><!-- End .col-6 col-md-4 col-lg-4 col-xl-3 col-xxl-2 -->
    `;

    // Append the product HTML to the product list container
    $('#product-list').append(productHtml);
  })
}
}