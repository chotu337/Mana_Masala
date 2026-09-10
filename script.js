/* =========================================
   MANA MASALA - ORDER SYSTEM
========================================= */
const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";
const EDGE_FUNCTION_NAME =
    "new-order-notification";
const PRICE_PER_KG = 400;
const MINIMUM_ORDER = 10;
/* =========================================
   LOAD SUPABASE
========================================= */
const supabaseScript =
    document.createElement("script");
supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
supabaseScript.onload = function () {
    window.manaSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
    console.log("✅ Mana Masala Supabase connected");
};
supabaseScript.onerror = function () {
    console.error(
        "❌ Supabase library could not be loaded."
    );
};
document.head.appendChild(
    supabaseScript
);
/* =========================================
   GET ELEMENTS
========================================= */
const quantityInput =
    document.getElementById("quantity");
const decreaseButton =
    document.getElementById(
        "decreaseQuantity"
    );
const increaseButton =
    document.getElementById(
        "increaseQuantity"
    );
const summaryQuantity =
    document.getElementById(
        "summaryQuantity"
    );
const totalPrice =
    document.getElementById(
        "totalPrice"
    );
const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );
const orderMessage =
    document.getElementById(
        "orderMessage"
    );
/* =========================================
   UPDATE TOTAL
========================================= */
function updateTotal() {
    let quantity =
        parseInt(quantityInput.value);
    if (
        isNaN(quantity) ||
        quantity < MINIMUM_ORDER
    ) {
        quantity =
            MINIMUM_ORDER;
        quantityInput.value =
            MINIMUM_ORDER;
    }
    const total =
        quantity * PRICE_PER_KG;
    summaryQuantity.textContent =
        quantity;
    totalPrice.textContent =
        total.toLocaleString("en-IN");
}
/* =========================================
   MESSAGE
========================================= */
function showMessage(
    message,
    type
) {
    orderMessage.textContent =
        message;
    orderMessage.style.color =
        type === "success"
            ? "green"
            : "red";
}
/* =========================================
   PLUS
========================================= */
increaseButton.addEventListener(
    "click",
    function () {
        let quantity =
            parseInt(
                quantityInput.value
            );
        if (isNaN(quantity)) {
            quantity = MINIMUM_ORDER;
        }
        quantity++;
        quantityInput.value =
            quantity;
        updateTotal();
    }
);
/* =========================================
   MINUS
========================================= */
decreaseButton.addEventListener(
    "click",
    function () {
        let quantity =
            parseInt(
                quantityInput.value
            );
        if (
            isNaN(quantity) ||
            quantity <= MINIMUM_ORDER
        ) {
            quantity =
                MINIMUM_ORDER;
        } else {
            quantity--;
        }
        quantityInput.value =
            quantity;
        updateTotal();
    }
);
/* =========================================
   MANUAL QUANTITY
========================================= */
quantityInput.addEventListener(
    "input",
    updateTotal
);
/* =========================================
   PLACE ORDER
========================================= */
placeOrderButton.addEventListener(
    "click",
    async function () {
        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();
        const customerPhone =
            document
                .getElementById("customerPhone")
                .value
                .trim();
        const quantity =
            parseInt(
                quantityInput.value
            );
        const address =
            document
                .getElementById("address")
                .value
                .trim();
        /* =====================================
           VALIDATION
        ===================================== */
        if (customerName === "") {
            showMessage(
                "❌ Please enter your name.",
                "error"
            );
            return;
        }
        if (
            !/^[0-9]{10}$/.test(
                customerPhone
            )
        ) {
            showMessage(
                "❌ Please enter a valid 10-digit phone number.",
                "error"
            );
            return;
        }
        if (
            isNaN(quantity) ||
            quantity < MINIMUM_ORDER
        ) {
            showMessage(
                "❌ Minimum order is 10 kg.",
                "error"
            );
            return;
        }
        if (address === "") {
            showMessage(
                "❌ Please enter your delivery address.",
                "error"
            );
            return;
        }
        if (!window.manaSupabase) {
            showMessage(
                "❌ Database is still connecting. Please try again.",
                "error"
            );
            return;
        }
        /* =====================================
           TOTAL
        ===================================== */
        const total =
            quantity * PRICE_PER_KG;
        /* =====================================
           ORDER OBJECT
        ===================================== */
        const orderData = {
            customer_name:
                customerName,
            customer_phone:
                customerPhone,
            quantity_kg:
                quantity,
            address:
                address,
            total_amount:
                total,
            status:
                "New"
        };
        /* =====================================
           BUTTON
        ===================================== */
        placeOrderButton.disabled =
            true;
        placeOrderButton.textContent =
            "Placing Order...";
        try {
            console.log(
                "📦 Saving Mana Masala order..."
            );
            /* =================================
               INSERT ONLY
               
               IMPORTANT:
               No .select()
               No .single()
               
               This prevents the anonymous
               customer from needing SELECT
               permission.
            ================================= */
            const { error } =
                await window.manaSupabase
                    .from("orders")
                    .insert([
                        orderData
                    ]);
            /* =================================
               DATABASE ERROR
            ================================= */
            if (error) {
                console.error(
                    "❌ SUPABASE ERROR:",
                    error
                );
                console.error(
                    "MESSAGE:",
                    error.message
                );
                console.error(
                    "CODE:",
                    error.code
                );
                console.error(
                    "DETAILS:",
                    error.details
                );
                console.error(
                    "HINT:",
                    error.hint
                );
                showMessage(
                    "❌ Order could not be saved: " +
                    error.message,
                    "error"
                );
                return;
            }
            /* =================================
               ORDER SAVED
            ================================= */
            console.log(
                "✅ MANA MASALA ORDER SAVED"
            );
            /* =================================
               CALL EDGE FUNCTION
            ================================= */
            console.log(
                "📧 Sending order notification..."
            );
            const {
                data: notificationData,
                error: notificationError
            } =
                await window.manaSupabase
                    .functions
                    .invoke(
                        EDGE_FUNCTION_NAME,
                        {
                            body: {
                                order:
                                    orderData
                            }
                        }
                    );
            /* =================================
               NOTIFICATION ERROR
            ================================= */
            if (notificationError) {
                console.error(
                    "❌ NOTIFICATION ERROR:",
                    notificationError
                );
                /*
                 Order is already saved.
                 Therefore the customer should
                 still see a successful order.
                */
                showMessage(
                    "✅ Order placed successfully! Total amount: ₹" +
                    total.toLocaleString("en-IN"),
                    "success"
                );
            } else {
                console.log(
                    "✅ EMAIL NOTIFICATION SENT"
                );
                console.log(
                    notificationData
                );
                showMessage(
                    "✅ Order placed successfully! Total amount: ₹" +
                    total.toLocaleString("en-IN"),
                    "success"
                );
            }
            /* =================================
               CLEAR FORM
            ================================= */
            document.getElementById(
                "customerName"
            ).value = "";
            document.getElementById(
                "customerPhone"
            ).value = "";
            document.getElementById(
                "address"
            ).value = "";
            quantityInput.value =
                MINIMUM_ORDER;
            updateTotal();
        } catch (error) {
            console.error(
                "❌ UNEXPECTED ERROR:",
                error
            );
            console.error(
                "MESSAGE:",
                error.message
            );
            showMessage(
                "❌ Something went wrong. Please try again.",
                "error"
            );
        } finally {
            placeOrderButton.disabled =
                false;
            placeOrderButton.textContent =
                "Place Order";
        }
    }
);
/* =========================================
   INITIAL TOTAL
========================================= */
updateTotal();
