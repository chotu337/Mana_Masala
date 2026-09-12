/* =========================================================
   MANA MASALA - CUSTOMER ORDER SCRIPT
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
   LOAD SUPABASE
========================================================= */
function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }
        const script =
            document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            reject(
                new Error(
                    "Unable to load Supabase library."
                )
            );
        };
        document.head.appendChild(script);
    });
}
/* =========================================================
   INITIALIZE
========================================================= */
async function initializeManaMasala() {
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
            "Mana Masala Supabase connected."
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
                "Website connection problem. Please refresh and try again.";
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
    const increaseButton =
        document.getElementById(
            "increaseQuantity"
        );
    const decreaseButton =
        document.getElementById(
            "decreaseQuantity"
        );
    const placeOrderButton =
        document.getElementById(
            "placeOrderButton"
        );
    const orderMessage =
        document.getElementById(
            "orderMessage"
        );
    /* =====================================================
       CHECK ELEMENTS
    ===================================================== */
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
       GET DISPLAY ELEMENTS
    ===================================================== */
    const summaryQuantity =
        document.getElementById(
            "summaryQuantity"
        );
    const totalPrice =
        document.getElementById(
            "totalPrice"
        );
    const paymentAmount =
        document.getElementById(
            "paymentAmount"
        );
    const paymentAmountInstruction =
        document.getElementById(
            "paymentAmountInstruction"
        );
    /* =====================================================
       FORMAT CURRENCY
    ===================================================== */
    function formatAmount(amount) {
        return amount.toLocaleString(
            "en-IN"
        );
    }
    /* =====================================================
       UPDATE ALL ORDER AMOUNTS
    ===================================================== */
    function updateTotal() {
        let quantity =
            parseInt(
                quantityInput.value,
                10
            );
        /* ---------------------------------------------
           DEFAULT QUANTITY
        --------------------------------------------- */
        if (
            isNaN(quantity) ||
            quantity < MINIMUM_ORDER
        ) {
            quantity =
                MINIMUM_ORDER;
        }
        /* ---------------------------------------------
           UPDATE INPUT
        --------------------------------------------- */
        quantityInput.value =
            quantity;
        /* ---------------------------------------------
           CALCULATE TOTAL
        --------------------------------------------- */
        const total =
            quantity *
            PRICE_PER_KG;
        /* ---------------------------------------------
           UPDATE SUMMARY QUANTITY
        --------------------------------------------- */
        if (summaryQuantity) {
            summaryQuantity.textContent =
                quantity;
        }
        /* ---------------------------------------------
           UPDATE TOTAL PRICE
        --------------------------------------------- */
        if (totalPrice) {
            totalPrice.textContent =
                formatAmount(total);
        }
        /* ---------------------------------------------
           UPDATE PAYMENT AMOUNT
        --------------------------------------------- */
        if (paymentAmount) {
            paymentAmount.textContent =
                formatAmount(total);
        }
        /* ---------------------------------------------
           UPDATE PAYMENT INSTRUCTION
        --------------------------------------------- */
        if (
            paymentAmountInstruction
        ) {
            paymentAmountInstruction.textContent =
                formatAmount(total);
        }
        /* ---------------------------------------------
           OPTIONAL TOTAL AMOUNT
           
           Supports older HTML if present.
        --------------------------------------------- */
        const totalAmount =
            document.getElementById(
                "totalAmount"
            );
        if (totalAmount) {
            totalAmount.textContent =
                "₹" +
                formatAmount(total);
        }
        return {
            quantity: quantity,
            total: total
        };
    }
    /* =====================================================
       + BUTTON
    ===================================================== */
    if (increaseButton) {
        increaseButton.addEventListener(
            "click",
            function () {
                let quantity =
                    parseInt(
                        quantityInput.value,
                        10
                    );
                if (isNaN(quantity)) {
                    quantity =
                        MINIMUM_ORDER;
                }
                quantity++;
                quantityInput.value =
                    quantity;
                updateTotal();
            }
        );
    }
    /* =====================================================
       − BUTTON
    ===================================================== */
    if (decreaseButton) {
        decreaseButton.addEventListener(
            "click",
            function () {
                let quantity =
                    parseInt(
                        quantityInput.value,
                        10
                    );
                if (isNaN(quantity)) {
                    quantity =
                        MINIMUM_ORDER;
                }
                quantity--;
                /* -----------------------------------------
                   NEVER GO BELOW 10 KG
                ----------------------------------------- */
                if (
                    quantity <
                    MINIMUM_ORDER
                ) {
                    quantity =
                        MINIMUM_ORDER;
                }
                quantityInput.value =
                    quantity;
                updateTotal();
            }
        );
    }
    /* =====================================================
       MANUAL QUANTITY INPUT
    ===================================================== */
    quantityInput.addEventListener(
        "input",
        function () {
            let quantity =
                parseInt(
                    quantityInput.value,
                    10
                );
            /*
             * While typing, don't immediately
             * overwrite an empty input.
             */
            if (quantityInput.value === "") {
                return;
            }
            if (
                !isNaN(quantity)
            ) {
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
    );
    /* =====================================================
       INITIAL TOTAL
    ===================================================== */
    updateTotal();
    /* =====================================================
       PLACE ORDER
    ===================================================== */
    placeOrderButton.addEventListener(
        "click",
        async function () {
            /* ---------------------------------------------
               CLEAR OLD MESSAGE
            --------------------------------------------- */
            orderMessage.textContent =
                "";
            orderMessage.className =
                "";
            orderMessage.style.display =
                "block";
            /* ---------------------------------------------
               GET FORM VALUES
            --------------------------------------------- */
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
            /* ---------------------------------------------
               VALIDATE NAME
            --------------------------------------------- */
            if (!customerName) {
                orderMessage.textContent =
                    "Please enter your name.";
                orderMessage.className =
                    "error";
                nameInput.focus();
                return;
            }
            /* ---------------------------------------------
               VALIDATE PHONE
            --------------------------------------------- */
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
            /* ---------------------------------------------
               VALIDATE ADDRESS
            --------------------------------------------- */
            if (!address) {
                orderMessage.textContent =
                    "Please enter your delivery address.";
                orderMessage.className =
                    "error";
                addressInput.focus();
                return;
            }
            /* ---------------------------------------------
               VALIDATE QUANTITY
            --------------------------------------------- */
            if (
                isNaN(quantity) ||
                quantity <
                MINIMUM_ORDER
            ) {
                orderMessage.textContent =
                    "Minimum order is " +
                    MINIMUM_ORDER +
                    " kg.";
                orderMessage.className =
                    "error";
                quantityInput.focus();
                return;
            }
            /* ---------------------------------------------
               CALCULATE FINAL TOTAL
            --------------------------------------------- */
            const total =
                quantity *
                PRICE_PER_KG;
            /* ---------------------------------------------
               CREATE ORDER REFERENCE
            --------------------------------------------- */
            const orderReference =
                "MM-" +
                Date.now().toString();
            /* ---------------------------------------------
               ORDER DATA
            --------------------------------------------- */
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
            /* ---------------------------------------------
               DISABLE BUTTON
            --------------------------------------------- */
            placeOrderButton.disabled =
                true;
            const originalButtonText =
                placeOrderButton.innerHTML;
            placeOrderButton.innerHTML =
                "⏳ Saving Order...";
            try {
                console.log(
                    "Sending order to Supabase:",
                    orderData
                );
                /* =========================================
                   INSERT ORDER
                ========================================= */
                const {
                    error: insertError
                } =
                    await window.manaSupabase
                        .from("orders")
                        .insert([
                            orderData
                        ]);
                /* =========================================
                   INSERT ERROR
                ========================================= */
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
                /* =========================================
                   ORDER SAVED
                ========================================= */
                console.log(
                    "Order successfully saved."
                );
                /* =========================================
                   NOTIFICATION DATA
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
                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */
                orderMessage.textContent =
                    "✅ Order placed successfully! We will contact you for confirmation.";
                orderMessage.className =
                    "success";
                /* =========================================
                   OWNER NOTIFICATION
                ========================================= */
                try {
                    console.log(
                        "Sending owner notification..."
                    );
                    const {
                        data: functionData,
                        error: functionError
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
                            "Notification function error:",
                            functionError
                        );
                    } else {
                        console.log(
                            "Notification response:",
                            functionData
                        );
                    }
                } catch (
                    notificationError
                ) {
                    /*
                     * Order is already saved.
                     * Notification failure must NOT
                     * make the order appear failed.
                     */
                    console.error(
                        "Notification error:",
                        notificationError
                    );
                }
                /* =========================================
                   RESET FORM
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
                   RESET ALL AMOUNTS
                ========================================= */
                updateTotal();
                /* =========================================
                   RESTORE BUTTON
                ========================================= */
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
        "Mana Masala order system ready."
    );
}
/* =========================================================
   START APPLICATION
========================================================= */
document.addEventListener(
    "DOMContentLoaded",
    initializeManaMasala
);
