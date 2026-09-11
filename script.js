/* =========================================================
   MANA MASALA - COMPLETE ORDER SYSTEM
   Supabase + Email Notification
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

    script.onload = initializeManaMasala;

    script.onerror = function () {
        console.error("Unable to load Supabase library.");

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
        console.error("Supabase library not available.");
        return;
    }

    try {

        window.manaSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log("Supabase initialized successfully.");

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

    const placeOrderButton =
        document.getElementById("placeOrderButton");

    const orderMessage =
        document.getElementById("orderMessage");


    /* =====================================================
       CHECK REQUIRED ELEMENTS
    ===================================================== */

    if (!quantityInput) {
        console.error(
            "Quantity input #quantity not found."
        );
        return;
    }

    if (!placeOrderButton) {
        console.error(
            "Place Order button #placeOrderButton not found."
        );
        return;
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(message, isError = false) {

        if (!orderMessage) {
            alert(message);
            return;
        }

        orderMessage.textContent = message;

        orderMessage.style.display = "block";

        orderMessage.style.color =
            isError ? "red" : "green";

        orderMessage.style.fontWeight = "600";

        orderMessage.style.whiteSpace = "pre-line";
    }


    /* =====================================================
       UPDATE SUMMARY
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
                "₹" +
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
                    isNaN(quantity) ||
                    quantity < MINIMUM_ORDER
                ) {
                    quantity = MINIMUM_ORDER;
                }

                if (quantity > MINIMUM_ORDER) {

                    quantity--;

                    quantityInput.value =
                        quantity;

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
                    parseInt(
                        quantityInput.value,
                        10
                    );

                if (
                    isNaN(quantity) ||
                    quantity < MINIMUM_ORDER
                ) {
                    quantity = MINIMUM_ORDER;
                }

                quantity++;

                quantityInput.value =
                    quantity;

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

            /* ---------------------------------------------
               CLEAR OLD MESSAGE
            --------------------------------------------- */

            if (orderMessage) {

                orderMessage.textContent = "";

                orderMessage.style.display =
                    "none";

            }


            /* ---------------------------------------------
               GET CUSTOMER FIELDS
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


            /* ---------------------------------------------
               GET QUANTITY
            --------------------------------------------- */

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
               CREATE ORDER DATA
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
                "Order data:",
                orderData
            );


            /* ---------------------------------------------
               BUTTON LOADING
            --------------------------------------------- */

            placeOrderButton.disabled =
                true;

            placeOrderButton.textContent =
                "Placing Order...";


            try {

                /* =========================================
                   CHECK SUPABASE CLIENT
                ========================================= */

                if (!window.manaSupabase) {

                    throw new Error(
                        "Supabase is not initialized."
                    );

                }


                /* =========================================
                   SAVE ORDER
                ========================================= */

                console.log(
                    "Saving order to Supabase..."
                );


                const {
                    data: savedOrder,
                    error: insertError
                } =
                    await window.manaSupabase
                        .from("orders")
                        .insert(
                            [orderData]
                        )
                        .select()
                        .single();


                /* =========================================
                   HANDLE INSERT ERROR
                ========================================= */

                if (insertError) {

                    console.error(
                        "SUPABASE INSERT ERROR:",
                        insertError
                    );

                    const detailedError =
                        [
                            "Order could not be saved.",
                            "",
                            "Code: " +
                                (
                                    insertError.code ||
                                    "N/A"
                                ),
                            "Message: " +
                                (
                                    insertError.message ||
                                    "Unknown error"
                                ),
                            "Details: " +
                                (
                                    insertError.details ||
                                    "N/A"
                                ),
                            "Hint: " +
                                (
                                    insertError.hint ||
                                    "N/A"
                                )
                        ].join("\n");


                    showMessage(
                        detailedError,
                        true
                    );

                    return;

                }


                /* =========================================
                   ORDER SUCCESSFULLY SAVED
                ========================================= */

                console.log(
                    "ORDER SAVED SUCCESSFULLY:",
                    savedOrder
                );


                /* =========================================
                   SEND NOTIFICATION
                ========================================= */

                let notificationSuccessful =
                    false;


                try {

                    console.log(
                        "Sending notification..."
                    );


                    const {
                        data:
                            notificationData,
                        error:
                            notificationError
                    } =
                        await window
                            .manaSupabase
                            .functions
                            .invoke(
                                EDGE_FUNCTION_NAME,
                                {
                                    body: {
                                        order:
                                            savedOrder ||
                                            orderData
                                    }
                                }
                            );


                    if (notificationError) {

                        console.error(
                            "NOTIFICATION ERROR:",
                            notificationError
                        );

                    } else {

                        console.log(
                            "NOTIFICATION SUCCESS:",
                            notificationData
                        );

                        notificationSuccessful =
                            true;

                    }

                } catch (notificationException) {

                    console.error(
                        "Notification exception:",
                        notificationException
                    );

                }


                /* =========================================
                   CUSTOMER SUCCESS MESSAGE
                ========================================= */

                if (notificationSuccessful) {

                    showMessage(
                        "Order placed successfully!\n" +
                        "We will contact you soon."
                    );

                } else {

                    showMessage(
                        "Order placed successfully!\n" +
                        "We will contact you soon."
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

                /* =========================================
                   COMPLETE ERROR DETAILS
                ========================================= */

                console.error(
                    "COMPLETE ORDER ERROR:",
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

                    "Order could not be completed.\n\n" +

                    "Error: " +

                    (
                        error?.message ||
                        "Unknown error"
                    ),

                    true

                );

            } finally {

                /* =========================================
                   RESTORE BUTTON
                ========================================= */

                placeOrderButton.disabled =
                    false;

                placeOrderButton.textContent =
                    "Place Order";

            }

        }
    );


    /* =====================================================
       INITIAL SUMMARY
    ===================================================== */

    updateSummary();

}
