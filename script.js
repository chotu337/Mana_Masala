/* =========================================================
   MANA MASALA - COMPLETE ORDER SYSTEM
   Supabase + Owner Email Notification
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

(function loadSupabase() {

    if (window.supabase) {
        initializeManaMasala();
        return;
    }

    const script = document.createElement("script");

    script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = function () {
        initializeManaMasala();
    };

    script.onerror = function () {

        console.error(
            "Unable to load Supabase library."
        );

        alert(
            "Unable to connect to the order system. " +
            "Please refresh the page and try again."
        );
    };

    document.head.appendChild(script);

})();


/* =========================================================
   INITIALIZE SUPABASE
========================================================= */

function initializeManaMasala() {

    if (!window.supabase) {

        console.error(
            "Supabase library is not available."
        );

        return;
    }

    try {

        window.manaSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "Mana Masala Supabase initialized."
        );

        setupOrderSystem();

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

    }

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

    const paymentAmount =
        document.getElementById("paymentAmount");

    const paymentAmountInstruction =
        document.getElementById(
            "paymentAmountInstruction"
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
       REQUIRED ELEMENT CHECK
    ===================================================== */

    if (!quantityInput) {

        console.error(
            "Quantity input was not found."
        );

        return;
    }

    if (!placeOrderButton) {

        console.error(
            "Place Order button was not found."
        );

        return;
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(
        message,
        isError = false
    ) {

        if (!orderMessage) {

            alert(message);
            return;

        }

        orderMessage.textContent =
            message;

        orderMessage.style.display =
            "block";

        orderMessage.style.color =
            isError
                ? "#b42318"
                : "#16803c";

        orderMessage.style.background =
            isError
                ? "#fff0ef"
                : "#effaf2";

        orderMessage.style.border =
            isError
                ? "1px solid #f2c5c1"
                : "1px solid #bfe5c9";

        orderMessage.style.padding =
            "15px";

        orderMessage.style.borderRadius =
            "8px";

        orderMessage.style.fontWeight =
            "700";

        orderMessage.style.whiteSpace =
            "pre-line";

    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateSummary() {

        let quantity =
            parseInt(
                quantityInput.value,
                10
            );

        if (
            Number.isNaN(quantity) ||
            quantity < MINIMUM_ORDER
        ) {

            quantity =
                MINIMUM_ORDER;

            quantityInput.value =
                quantity;

        }

        const total =
            quantity * PRICE_PER_KG;


        if (summaryQuantity) {

            summaryQuantity.textContent =
                quantity;

        }


        if (totalPrice) {

            totalPrice.textContent =
                total.toLocaleString("en-IN");

        }


        if (paymentAmount) {

            paymentAmount.textContent =
                total.toLocaleString("en-IN");

        }


        if (paymentAmountInstruction) {

            paymentAmountInstruction.textContent =
                total.toLocaleString("en-IN");

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
                    parseInt(
                        quantityInput.value,
                        10
                    );

                if (
                    Number.isNaN(quantity) ||
                    quantity <= MINIMUM_ORDER
                ) {

                    quantity =
                        MINIMUM_ORDER;

                } else {

                    quantity--;

                }

                quantityInput.value =
                    quantity;

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
                    parseInt(
                        quantityInput.value,
                        10
                    );

                if (
                    Number.isNaN(quantity) ||
                    quantity < MINIMUM_ORDER
                ) {

                    quantity =
                        MINIMUM_ORDER;

                } else {

                    quantity++;

                }

                quantityInput.value =
                    quantity;

                updateSummary();

            }
        );

    }


    /* =====================================================
       MANUAL QUANTITY
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

            /* ---------------------------------------------
               CLEAR PREVIOUS MESSAGE
            --------------------------------------------- */

            if (orderMessage) {

                orderMessage.textContent =
                    "";

                orderMessage.style.display =
                    "none";

            }


            /* ---------------------------------------------
               GET FORM ELEMENTS
            --------------------------------------------- */

            const nameElement =
                document.getElementById(
                    "customerName"
                );

            const phoneElement =
                document.getElementById(
                    "customerPhone"
                );

            const addressElement =
                document.getElementById(
                    "address"
                );


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


            let quantity =
                parseInt(
                    quantityInput.value,
                    10
                );


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


            if (
                !/^[0-9]{10}$/.test(
                    customerPhone
                )
            ) {

                showMessage(
                    "Please enter a valid 10-digit phone number.",
                    true
                );

                return;
            }


            if (
                Number.isNaN(quantity) ||
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
                    "Please enter your complete delivery address.",
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
               ORDER DATA
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


            console.log(
                "Preparing order:",
                orderData
            );


            /* ---------------------------------------------
               DISABLE BUTTON
            --------------------------------------------- */

            placeOrderButton.disabled =
                true;

            placeOrderButton.innerHTML =
                "Placing Order...";


            try {

                /* =========================================
                   CHECK SUPABASE
                ========================================= */

                if (!window.manaSupabase) {

                    throw new Error(
                        "Supabase is not initialized. Please refresh the page."
                    );

                }


                /* =========================================
                   SAVE ORDER
                ========================================= */

                console.log(
                    "Saving order to Supabase..."
                );


                const {
                    data: insertedOrder,
                    error: insertError
                } =
                    await window
                        .manaSupabase
                        .from("orders")
                        .insert([
                            orderData
                        ])
                        .select()
                        .single();


                /* =========================================
                   INSERT ERROR
                ========================================= */

                if (insertError) {

                    console.error(
                        "SUPABASE INSERT ERROR:",
                        insertError
                    );

                    throw new Error(
                        "Order could not be saved.\n" +
                        (
                            insertError.message ||
                            "Unknown Supabase error."
                        )
                    );

                }


                console.log(
                    "Order saved:",
                    insertedOrder
                );


                /* =========================================
                   CREATE NOTIFICATION DATA
                ========================================= */

                const notificationOrder = {

                    ...orderData,

                    id:
                        insertedOrder?.id ??
                        "N/A"

                };


                /* =========================================
                   SEND OWNER EMAIL
                ========================================= */

                console.log(
                    "Calling email notification function..."
                );


                const {
                    data: notificationData,
                    error: notificationError
                } =
                    await window
                        .manaSupabase
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


                /* =========================================
                   EMAIL ERROR
                ========================================= */

                if (notificationError) {

                    console.error(
                        "EMAIL FUNCTION ERROR:",
                        notificationError
                    );


                    let errorMessage =
                        notificationError.message ||
                        "Email notification failed.";


                    /*
                       The order was already saved.
                       Therefore do NOT tell customer that
                       the order itself failed.
                    */

                    showMessage(

                        "Order was saved successfully, " +
                        "but the owner email notification failed.\n\n" +
                        "Please contact the owner on WhatsApp:\n" +
                        "8367450301\n\n" +
                        "Email error: " +
                        errorMessage,

                        true
                    );

                } else {

                    /* =====================================
                       EMAIL SUCCESS
                    ===================================== */

                    console.log(
                        "EMAIL NOTIFICATION SUCCESS:",
                        notificationData
                    );


                    showMessage(

                        "Order placed successfully! ✓\n\n" +
                        "Your order has been received.\n" +
                        "The owner has been notified by email.\n\n" +
                        "Thank you for choosing Mana Masala."

                    );

                }


                /* =========================================
                   CLEAR FORM
                ========================================= */

                if (nameElement) {

                    nameElement.value =
                        "";

                }


                if (phoneElement) {

                    phoneElement.value =
                        "";

                }


                if (addressElement) {

                    addressElement.value =
                        "";

                }


                quantityInput.value =
                    MINIMUM_ORDER;


                updateSummary();


            } catch (error) {

                /* =========================================
                   COMPLETE ERROR
                ========================================= */

                console.error(
                    "ORDER SYSTEM ERROR:",
                    error
                );


                showMessage(

                    error?.message ||
                    "Something went wrong while placing the order.",

                    true

                );

            } finally {

                /* =========================================
                   RESTORE BUTTON
                ========================================= */

                placeOrderButton.disabled =
                    false;

                placeOrderButton.innerHTML =
                    "Confirm & Place Order <span>→</span>";

            }

        }
    );


    /* =====================================================
       INITIAL UPDATE
    ===================================================== */

    updateSummary();

}


/* =========================================================
   END OF SCRIPT
========================================================= */
