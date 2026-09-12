/* =========================================================
   MANA MASALA - CUSTOMER ORDER SYSTEM
   Quantity + Price + Supabase + Notification
========================================================= */
const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";
const EDGE_FUNCTION_NAME =
    "new-order-notification";
const PRICE_PER_KG = 400;
const MINIMUM_ORDER = 10;
/* =========================================================
   QUANTITY & PRICE SYSTEM
   This starts independently of Supabase.
========================================================= */
function setupQuantitySystem() {
    const quantityInput =
        document.getElementById("quantity");
    const increaseButton =
        document.getElementById("increaseQuantity");
    const decreaseButton =
        document.getElementById("decreaseQuantity");
    const summaryQuantity =
        document.getElementById("summaryQuantity");
    const totalPrice =
        document.getElementById("totalPrice");
    const paymentAmount =
        document.getElementById("paymentAmount");
    const paymentAmountInstruction =
        document.getElementById("paymentAmountInstruction");
    if (!quantityInput) {
        console.error("Quantity input not found.");
        return;
    }
    /* =====================================================
       FORMAT MONEY
    ===================================================== */
    function formatAmount(amount) {
        return Number(amount).toLocaleString("en-IN");
    }
    /* =====================================================
       CALCULATE & DISPLAY TOTAL
    ===================================================== */
    function updateTotal() {
        let quantity =
            parseInt(quantityInput.value, 10);
        if (
            isNaN(quantity) ||
            quantity < MINIMUM_ORDER
        ) {
            quantity = MINIMUM_ORDER;
        }
        quantityInput.value = quantity;
        const total =
            quantity * PRICE_PER_KG;
        /* SUMMARY QUANTITY */
        if (summaryQuantity) {
            summaryQuantity.textContent =
                quantity;
        }
        /* TOTAL PRICE */
        if (totalPrice) {
            totalPrice.textContent =
                formatAmount(total);
        }
        /* PAYMENT AMOUNT */
        if (paymentAmount) {
            paymentAmount.textContent =
                formatAmount(total);
        }
        /* PAYMENT INSTRUCTION */
        if (paymentAmountInstruction) {
            paymentAmountInstruction.textContent =
                formatAmount(total);
        }
        /* OPTIONAL OLD ELEMENT */
        const totalAmount =
            document.getElementById("totalAmount");
        if (totalAmount) {
            totalAmount.textContent =
                "₹" + formatAmount(total);
        }
        console.log(
            "Quantity:",
            quantity,
            "Total:",
            total
        );
        return {
            quantity: quantity,
            total: total
        };
    }
    /* =====================================================
       PLUS BUTTON
    ===================================================== */
    if (increaseButton) {
        increaseButton.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                let quantity =
                    parseInt(
                        quantityInput.value,
                        10
                    );
                if (
                    isNaN(quantity) ||
                    quantity < MINIMUM_ORDER
                ) {
                    quantity =
                        MINIMUM_ORDER;
                }
                quantity =
                    quantity + 1;
                quantityInput.value =
                    quantity;
                updateTotal();
            }
        );
    }
    /* =====================================================
       MINUS BUTTON
    ===================================================== */
    if (decreaseButton) {
        decreaseButton.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                let quantity =
                    parseInt(
                        quantityInput.value,
                        10
                    );
                if (
                    isNaN(quantity) ||
                    quantity <= MINIMUM_ORDER
                ) {
                    quantity =
                        MINIMUM_ORDER;
                } else {
                    quantity =
                        quantity - 1;
                }
                quantityInput.value =
                    quantity;
                updateTotal();
            }
        );
    }
    /* =====================================================
       MANUAL INPUT
    ===================================================== */
    quantityInput.addEventListener(
        "input",
        function () {
            if (
                quantityInput.value === ""
            ) {
                return;
            }
            let quantity =
                parseInt(
                    quantityInput.value,
                    10
                );
            if (!isNaN(quantity)) {
                if (
                    quantity <
                    MINIMUM_ORDER
                ) {
                    quantity =
                        MINIMUM_ORDER;
                    quantityInput.value =
                        quantity;
                }
                updateTotal();
            }
        }
    );
    quantityInput.addEventListener(
        "change",
        function () {
            updateTotal();
        }
    );
    quantityInput.addEventListener(
        "blur",
        function () {
            let quantity =
                parseInt(
                    quantityInput.value,
                    10
                );
            if (
                isNaN(quantity) ||
                quantity < MINIMUM_ORDER
            ) {
                quantity =
                    MINIMUM_ORDER;
                quantityInput.value =
                    quantity;
            }
            updateTotal();
        }
    );
    /* =====================================================
       INITIAL DISPLAY
    ===================================================== */
    updateTotal();
    /* Make available to other code */
    window.updateManaMasalaTotal =
        updateTotal;
    window.getManaMasalaOrderTotal =
        function () {
            return updateTotal();
        };
    console.log(
        "✅ Quantity system ready."
    );
}
/* =========================================================
   LOAD SUPABASE
========================================================= */
function loadSupabase() {
    return new Promise(
        function (resolve, reject) {
            if (window.supabase) {
                resolve();
                return;
            }
            const script =
                document.createElement("script");
            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
            script.onload =
                function () {
                    resolve();
                };
            script.onerror =
                function () {
                    reject(
                        new Error(
                            "Unable to load Supabase library."
                        )
                    );
                };
            document.head.appendChild(
                script
            );
        }
    );
}
/* =========================================================
   INITIALIZE SUPABASE
========================================================= */
async function initializeSupabase() {
    try {
        await loadSupabase();
        if (!window.supabase) {
            throw new Error(
                "Supabase library not available."
            );
        }
        window.manaSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );
        console.log(
            "✅ Mana Masala Supabase connected."
        );
        setupOrderSystem();
    } catch (error) {
        console.error(
            "Supabase initialization error:",
            error
        );
        const message =
            document.getElementById(
                "orderMessage"
            );
        if (message) {
            message.textContent =
                "Order service is temporarily unavailable. Please refresh the page.";
            message.className =
                "error";
            message.style.display =
                "block";
        }
    }
}
/* =========================================================
   ORDER SYSTEM
========================================================= */
function setupOrderSystem() {
    const nameInput =
        document.getElementById(
            "customerName"
        );
    const phoneInput =
        document.getElementById(
            "customerPhone"
        );
    const addressInput =
        document.getElementById(
            "address"
        );
    const quantityInput =
        document.getElementById(
            "quantity"
        );
    const placeOrderButton =
        document.getElementById(
            "placeOrderButton"
        );
    const orderMessage =
        document.getElementById(
            "orderMessage"
        );
    if (
        !nameInput ||
        !phoneInput ||
        !addressInput ||
        !quantityInput ||
        !placeOrderButton
    ) {
        console.error(
            "Order form elements not found."
        );
        return;
    }
    /* =====================================================
       PLACE ORDER
    ===================================================== */
    placeOrderButton.addEventListener(
        "click",
        async function () {
            orderMessage.textContent =
                "";
            orderMessage.className =
                "";
            orderMessage.style.display =
                "block";
            /* =============================================
               GET VALUES
            ============================================= */
            const customerName =
                nameInput.value.trim();
            const customerPhone =
                phoneInput.value.trim();
            const address =
                addressInput.value.trim();
            let quantity =
                parseInt(
                    quantityInput.value,
                    10
                );
            /* =============================================
               NAME
            ============================================= */
            if (!customerName) {
                orderMessage.textContent =
                    "Please enter your name.";
                orderMessage.className =
                    "error";
                nameInput.focus();
                return;
            }
            /* =============================================
               PHONE
            ============================================= */
            const cleanPhone =
                customerPhone.replace(
                    /\D/g,
                    ""
                );
            if (
                cleanPhone.length !== 10
            ) {
                orderMessage.textContent =
                    "Please enter a valid 10-digit mobile number.";
                orderMessage.className =
                    "error";
                phoneInput.focus();
                return;
            }
            /* =============================================
               ADDRESS
            ============================================= */
            if (!address) {
                orderMessage.textContent =
                    "Please enter your delivery address.";
                orderMessage.className =
                    "error";
                addressInput.focus();
                return;
            }
            /* =============================================
               QUANTITY
            ============================================= */
            if (
                isNaN(quantity) ||
                quantity < MINIMUM_ORDER
            ) {
                quantity =
                    MINIMUM_ORDER;
                quantityInput.value =
                    quantity;
                if (
                    window.updateManaMasalaTotal
                ) {
                    window.updateManaMasalaTotal();
                }
                orderMessage.textContent =
                    "Minimum order is 10 kg.";
                orderMessage.className =
                    "error";
                quantityInput.focus();
                return;
            }
            /* =============================================
               FINAL TOTAL
            ============================================= */
            const total =
                quantity *
                PRICE_PER_KG;
            /* =============================================
               ORDER REFERENCE
            ============================================= */
            const orderReference =
                "MM-" +
                Date.now();
            /* =============================================
               ORDER DATA
            ============================================= */
            const orderData = {
                customer_name:
                    customerName,
                customer_phone:
                    cleanPhone,
                quantity_kg:
                    quantity,
                address:
                    address,
                total_amount:
                    total,
                status:
                    "New"
            };
            /* =============================================
               DISABLE BUTTON
            ============================================= */
            placeOrderButton.disabled =
                true;
            const originalButtonText =
                placeOrderButton.innerHTML;
            placeOrderButton.innerHTML =
                "⏳ Saving Order...";
            try {
                console.log(
                    "Sending order:",
                    orderData
                );
                /* =========================================
                   SAVE ORDER
                ========================================= */
                const {
                    error: insertError
                } =
                    await window.manaSupabase
                        .from("orders")
                        .insert([
                            orderData
                        ]);
                if (insertError) {
                    console.error(
                        "ORDER INSERT ERROR:",
                        insertError
                    );
                    orderMessage.textContent =
                        "Order could not be saved. " +
                        insertError.message;
                    orderMessage.className =
                        "error";
                    placeOrderButton.disabled =
                        false;
                    placeOrderButton.innerHTML =
                        originalButtonText;
                    return;
                }
                console.log(
                    "✅ Order successfully saved."
                );
                /* =========================================
                   NOTIFICATION
                ========================================= */
                const notificationOrder = {
                    id:
                        orderReference,
                    customer_name:
                        customerName,
                    customer_phone:
                        cleanPhone,
                    quantity_kg:
                        quantity,
                    address:
                        address,
                    total_amount:
                        total,
                    status:
                        "New"
                };
                try {
                    const {
                        data:
                            functionData,
                        error:
                            functionError
                    } =
                        await window.manaSupabase
                            .functions
                            .invoke(
                                EDGE_FUNCTION_NAME,
                                {
                                    body: {
                                        order:
                                            notificationOrder
                                    }
                                }
                            );
                    if (functionError) {
                        console.error(
                            "Notification error:",
                            functionError
                        );
                    } else {
                        console.log(
                            "Notification sent:",
                            functionData
                        );
                    }
                } catch (
                    notificationError
                ) {
                    console.error(
                        "Notification failed:",
                        notificationError
                    );
                }
                /* =========================================
                   SUCCESS
                ========================================= */
                orderMessage.textContent =
                    "✅ Order placed successfully! We will contact you for confirmation.";
                orderMessage.className =
                    "success";
                /* =========================================
                   CLEAR FORM
                ========================================= */
                nameInput.value =
                    "";
                phoneInput.value =
                    "";
                addressInput.value =
                    "";
                quantityInput.value =
                    MINIMUM_ORDER;
                /* =========================================
                   RESET AMOUNT
                ========================================= */
                if (
                    window.updateManaMasalaTotal
                ) {
                    window.updateManaMasalaTotal();
                }
                placeOrderButton.disabled =
                    false;
                placeOrderButton.innerHTML =
                    originalButtonText;
            } catch (error) {
                console.error(
                    "UNEXPECTED ORDER ERROR:",
                    error
                );
                orderMessage.textContent =
                    "Something went wrong. Please try again later.";
                orderMessage.className =
                    "error";
                placeOrderButton.disabled =
                    false;
                placeOrderButton.innerHTML =
                    originalButtonText;
            }
        }
    );
    console.log(
        "✅ Mana Masala order system ready."
    );
}
/* =========================================================
   START
========================================================= */
document.addEventListener(
    "DOMContentLoaded",
    function () {
        /*
         * IMPORTANT:
         * Quantity system starts FIRST.
         * It does not wait for Supabase.
         */
        setupQuantitySystem();
        /*
         * Supabase/order system starts separately.
         */
        initializeSupabase();
    }
);
