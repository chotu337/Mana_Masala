/* =========================================================
   MANA MASALA - ORDER SYSTEM
   Supabase + Email Notification
========================================================= */
const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";
const SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";
const EDGE_FUNCTION_NAME =
    "new-order-notification";
const PRICE_PER_KG = 400;
const MINIMUM_ORDER = 10;
/* =========================================================
   LOAD SUPABASE
========================================================= */
const supabaseScript = document.createElement("script");
supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
supabaseScript.onload = initializeManaMasala;
document.head.appendChild(supabaseScript);
/* =========================================================
   INITIALIZE
========================================================= */
function initializeManaMasala() {
    if (!window.supabase) {
        console.error("Supabase library failed to load.");
        return;
    }
    window.manaSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
    setupOrderSystem();
}
/* =========================================================
   ORDER SYSTEM
========================================================= */
function setupOrderSystem() {
    const quantityInput =
        document.getElementById("quantity");
    const decreaseButton =
        document.getElementById("decreaseQuantity");
    const increaseButton =
        document.getElementById("increaseQuantity");
    const summaryQuantity =
        document.getElementById("summaryQuantity");
    const totalPrice =
        document.getElementById("totalPrice");
    const placeOrderButton =
        document.getElementById("placeOrderButton");
    const orderMessage =
        document.getElementById("orderMessage");
    if (!quantityInput || !placeOrderButton) {
        console.error(
            "Order form elements were not found."
        );
        return;
    }
    /* =====================================================
       UPDATE ORDER SUMMARY
    ===================================================== */
    function updateSummary() {
        let quantity =
            parseInt(quantityInput.value, 10);
        if (
            isNaN(quantity) ||
            quantity < MINIMUM_ORDER
        ) {
            quantity = MINIMUM_ORDER;
            quantityInput.value = quantity;
        }
        const total =
            quantity * PRICE_PER_KG;
        if (summaryQuantity) {
            summaryQuantity.textContent =
                quantity + " kg";
        }
        if (totalPrice) {
            totalPrice.textContent =
                "₹" + total.toLocaleString("en-IN");
        }
    }
    /* =====================================================
       DECREASE QUANTITY
    ===================================================== */
    if (decreaseButton) {
        decreaseButton.addEventListener(
            "click",
            function () {
                let quantity =
                    parseInt(quantityInput.value, 10);
                if (isNaN(quantity)) {
                    quantity = MINIMUM_ORDER;
                }
                if (quantity > MINIMUM_ORDER) {
                    quantity--;
                    quantityInput.value = quantity;
                }
                updateSummary();
            }
        );
    }
    /* =====================================================
       INCREASE QUANTITY
    ===================================================== */
    if (increaseButton) {
        increaseButton.addEventListener(
            "click",
            function () {
                let quantity =
                    parseInt(quantityInput.value, 10);
                if (isNaN(quantity)) {
                    quantity = MINIMUM_ORDER;
                }
                quantity++;
                quantityInput.value = quantity;
                updateSummary();
            }
        );
    }
    /* =====================================================
       MANUAL QUANTITY CHANGE
    ===================================================== */
    quantityInput.addEventListener(
        "input",
        updateSummary
    );
    /* =====================================================
       PLACE ORDER
    ===================================================== */
    placeOrderButton.addEventListener(
        "click",
        async function () {
            if (orderMessage) {
                orderMessage.textContent = "";
            }
            /* ---------------------------------------------
               GET CUSTOMER DETAILS
            --------------------------------------------- */
            const nameElement =
                document.getElementById("customerName");
            const phoneElement =
                document.getElementById("customerPhone");
            const addressElement =
                document.getElementById("address");
            const customerName =
                nameElement
                    ? nameElement.value.trim()
                    : "";
            const customerPhone =
                phoneElement
                    ? phoneElement.value.trim()
                    : "";
            const address =
                addressElement
                    ? addressElement.value.trim()
                    : "";
            /* ---------------------------------------------
               GET QUANTITY
            --------------------------------------------- */
            let quantity =
                parseInt(quantityInput.value, 10);
            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */
            if (!customerName) {
                showMessage(
                    "Please enter your name.",
                    true
                );
                return;
            }
            if (!/^[0-9]{10}$/.test(customerPhone)) {
                showMessage(
                    "Please enter a valid 10-digit phone number.",
                    true
                );
                return;
            }
            if (
                isNaN(quantity) ||
                quantity < MINIMUM_ORDER
            ) {
                showMessage(
                    "Minimum order is " +
                    MINIMUM_ORDER +
                    " kg.",
                    true
                );
                return;
            }
            if (!address) {
                showMessage(
                    "Please enter your delivery address.",
                    true
                );
                return;
            }
            /* ---------------------------------------------
               CALCULATE TOTAL
            --------------------------------------------- */
            const total =
                quantity * PRICE_PER_KG;
            /* ---------------------------------------------
               ORDER OBJECT
            --------------------------------------------- */
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
            /* ---------------------------------------------
               BUTTON STATE
            --------------------------------------------- */
            placeOrderButton.disabled = true;
            placeOrderButton.textContent =
                "Placing Order...";
            try {
                /* =========================================
                   SAVE ORDER TO SUPABASE
                ========================================= */
                const {
                    error: insertError
                } =
                    await window.manaSupabase
                        .from("orders")
                        .insert([orderData]);
                if (insertError) {
                    console.error(
                        "Supabase insert error:",
                        insertError
                    );
                    throw insertError;
                }
                console.log(
                    "Order successfully saved:",
                    orderData
                );
                /* =========================================
                   SEND EMAIL NOTIFICATION
                ========================================= */
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
                                    order: orderData
                                }
                            }
                        );
                if (notificationError) {
                    console.error(
                        "Notification error:",
                        notificationError
                    );
                    /*
                       IMPORTANT:
                       The order is already saved.
                       Therefore we don't show the customer
                       that the order failed.
                    */
                    showMessage(
                        "Order placed successfully! " +
                        "We will contact you soon."
                    );
                } else {
                    console.log(
                        "Notification sent:",
                        notificationData
                    );
                    showMessage(
                        "Order placed successfully! " +
                        "Confirmation notification sent."
                    );
                }
                /* =========================================
                   CLEAR FORM
                ========================================= */
                if (nameElement) {
                    nameElement.value = "";
                }
                if (phoneElement) {
                    phoneElement.value = "";
                }
                if (addressElement) {
                    addressElement.value = "";
                }
                quantityInput.value =
                    MINIMUM_ORDER;
                updateSummary();
            } catch (error) {
                console.error(
                    "Order error:",
                    error
                );
                console.error(
                    "Error message:",
                    error?.message
                );
                console.error(
                    "Error code:",
                    error?.code
                );
                console.error(
                    "Error details:",
                    error?.details
                );
                console.error(
                    "Error hint:",
                    error?.hint
                );
                showMessage(
                    "Order could not be completed. " +
                    "Please try again later.",
                    true
                );
            } finally {
                placeOrderButton.disabled =
                    false;
                placeOrderButton.textContent =
                    "Place Order";
            }
        }
    );
    /* =====================================================
       MESSAGE FUNCTION
    ===================================================== */
    function showMessage(
        message,
        isError = false
    ) {
        if (!orderMessage) {
            return;
        }
        orderMessage.textContent =
            message;
        orderMessage.style.display =
            "block";
        if (isError) {
            orderMessage.style.color =
                "red";
        } else {
            orderMessage.style.color =
                "green";
        }
    }
    /* =====================================================
       INITIAL SUMMARY
    ===================================================== */
    updateSummary();
}
