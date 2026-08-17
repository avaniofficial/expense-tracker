import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://expense-tracker-cjp6.onrender.com/api";

function App() {

    // ==========================================
    // AUTH STATE
    // ==========================================

    const [user, setUser] = useState(
        localStorage.getItem("username")
    );

    const [showRegister, setShowRegister] =
        useState(false);

    const [authForm, setAuthForm] = useState({
        username: "",
        password: ""
    });

    const [authError, setAuthError] = useState("");
    const [authMessage, setAuthMessage] = useState("");


    // ==========================================
    // EXPENSE STATE
    // ==========================================

    const [expenses, setExpenses] = useState([]);

    const [total, setTotal] = useState(0);

    const [month, setMonth] = useState("");

    const [activePage, setActivePage] =
        useState("Dashboard");


    const [form, setForm] = useState({

        amount: "",

        category: "Food",

        description: "",

        date:
            new Date()
                .toISOString()
                .split("T")[0]
    });


    // ==========================================
    // AUTH FORM
    // ==========================================

    const handleAuthChange = (e) => {

        setAuthForm({

            ...authForm,

            [e.target.name]:
                e.target.value
        });

        setAuthError("");
    };


    // ==========================================
    // LOGIN
    // ==========================================

    const login = async (e) => {

        e.preventDefault();

        setAuthError("");

        setAuthMessage("");

        try {

            const response = await fetch(
                `${API_URL}/login/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(authForm)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                setAuthError(
                    data.error ||
                    "Invalid username or password."
                );

                return;
            }


            // Save username
            localStorage.setItem(
                "username",
                data.username
            );


            // Save token
            localStorage.setItem(
                "token",
                data.token
            );


            setUser(
                data.username
            );


            setAuthForm({
                username: "",
                password: ""
            });


        } catch (error) {

            console.error(error);

            setAuthError(
                "Cannot connect to Django server."
            );
        }
    };


    // ==========================================
    // REGISTER
    // ==========================================

    const register = async (e) => {

        e.preventDefault();

        setAuthError("");

        setAuthMessage("");


        try {

            const response = await fetch(
                `${API_URL}/register/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(authForm)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                const firstError =
                    Object.values(data)[0];


                setAuthError(

                    Array.isArray(firstError)
                        ? firstError[0]
                        : "Registration failed."
                );

                return;
            }


            // Automatically save account
            localStorage.setItem(
                "username",
                data.username
            );


            localStorage.setItem(
                "token",
                data.token
            );


            setUser(
                data.username
            );


            setAuthForm({
                username: "",
                password: ""
            });


        } catch (error) {

            console.error(error);

            setAuthError(
                "Cannot connect to Django server."
            );
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem(
            "username"
        );

        localStorage.removeItem(
            "token"
        );

        setUser(null);

        setExpenses([]);

        setTotal(0);

        setMonth("");
    };


    // ==========================================
    // GET EXPENSES
    // ==========================================

    const getExpenses = async () => {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            const response =
                await fetch(
                    `${API_URL}/expenses/`,
                    {
                        headers: {
                            Authorization:
                                `Token ${token}`
                        }
                    }
                );


            if (!response.ok) {

                console.log(
                    "Expense error:",
                    response.status
                );

                return;
            }


            const data =
                await response.json();


            setExpenses(data);


        } catch (error) {

            console.error(
                "Error fetching expenses:",
                error
            );
        }
    };


    // ==========================================
    // GET MONTHLY TOTAL
    // ==========================================

    const getMonthlyTotal = async () => {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            const response =
                await fetch(
                    `${API_URL}/monthly-total/`,
                    {
                        headers: {
                            Authorization:
                                `Token ${token}`
                        }
                    }
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            setTotal(
                Number(data.total)
            );


            setMonth(
                data.month
            );


        } catch (error) {

            console.error(
                "Error fetching total:",
                error
            );
        }
    };


    // ==========================================
    // LOAD USER DATA
    // ==========================================

    useEffect(() => {

        if (user) {

            getExpenses();

            getMonthlyTotal();
        }

    }, [user]);


    // ==========================================
    // EXPENSE FORM
    // ==========================================

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]:
                e.target.value
        });
    };


    // ==========================================
    // ADD EXPENSE
    // ==========================================

    const addExpense = async (e) => {

        e.preventDefault();


        if (
            !form.amount ||
            !form.description ||
            !form.date
        ) {

            alert(
                "Please fill all fields."
            );

            return;
        }


        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            const response =
                await fetch(
                    `${API_URL}/expenses/`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Token ${token}`
                        },

                        body:
                            JSON.stringify(form)
                    }
                );


            if (!response.ok) {

                const error =
                    await response.json();

                console.log(
                    "Add expense error:",
                    error
                );

                alert(
                    "Failed to add expense."
                );

                return;
            }


            // Clear form
            setForm({

                amount: "",

                category: "Food",

                description: "",

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0]
            });


            // Refresh data
            await getExpenses();

            await getMonthlyTotal();


            setActivePage(
                "Expenses"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to Django."
            );
        }
    };


    // ==========================================
    // DELETE EXPENSE
    // ==========================================

    const deleteExpense = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this expense?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            const response =
                await fetch(
                    `${API_URL}/expenses/${id}/`,
                    {

                        method: "DELETE",

                        headers: {

                            Authorization:
                                `Token ${token}`
                        }
                    }
                );


            if (!response.ok) {

                alert(
                    "Failed to delete expense."
                );

                return;
            }


            await getExpenses();

            await getMonthlyTotal();


        } catch (error) {

            console.error(error);
        }
    };


    // ==========================================
    // CATEGORY ICON
    // ==========================================

    const getIcon = (category) => {

        switch (category) {

            case "Food":
                return "🍔";

            case "Travel":
                return "🚗";

            case "Shopping":
                return "🛍️";

            case "Bills":
                return "🧾";

            case "Education":
                return "📚";

            case "Entertainment":
                return "🎬";

            default:
                return "💰";
        }
    };


    // ==========================================
    // ANALYTICS
    // ==========================================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayTotal =
        expenses

            .filter(
                expense =>
                    expense.date === today
            )

            .reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount
                    ),

                0
            );


    const categoryTotals = {};


    expenses.forEach(
        expense => {

            if (
                !categoryTotals[
                    expense.category
                ]
            ) {

                categoryTotals[
                    expense.category
                ] = 0;
            }


            categoryTotals[
                expense.category
            ] += Number(
                expense.amount
            );
        }
    );


    const categoryEntries =
        Object.entries(
            categoryTotals
        );


    const highestCategory =
        categoryEntries.length > 0

            ? categoryEntries.reduce(
                  (highest, current) =>
                      current[1] >
                      highest[1]
                          ? current
                          : highest
              )

            : null;


    const averageExpense =
        expenses.length > 0
            ? total /
              expenses.length
            : 0;


    const maxCategoryAmount =
        categoryEntries.length > 0

            ? Math.max(
                  ...categoryEntries.map(
                      ([, value]) =>
                          value
                  )
              )

            : 0;


    // ==========================================
    // LOGIN / REGISTER SCREEN
    // ==========================================

    if (!user) {

        return (

            <div className="auth-page">

                <div className="auth-card">

                    <div className="auth-logo">
                        💰
                    </div>


                    <h1>
                        Expense Tracker
                    </h1>


                    <p className="auth-subtitle">

                        {showRegister

                            ? "Create your account"

                            : "Welcome back! Login to continue"}

                    </p>


                    {authError && (

                        <div className="error-message">

                            {authError}

                        </div>

                    )}


                    <form
                        onSubmit={
                            showRegister
                                ? register
                                : login
                        }
                    >

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                value={
                                    authForm.username
                                }
                                onChange={
                                    handleAuthChange
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                value={
                                    authForm.password
                                }
                                onChange={
                                    handleAuthChange
                                }
                                required
                            />

                        </div>


                        <button
                            className="primary-button"
                            type="submit"
                        >

                            {showRegister
                                ? "Create Account"
                                : "Login"}

                        </button>

                    </form>


                    <div className="auth-switch">

                        {showRegister
                            ? "Already have an account?"
                            : "Don't have an account?"}


                        <button
                            onClick={() => {

                                setShowRegister(
                                    !showRegister
                                );

                                setAuthError("");

                                setAuthForm({
                                    username: "",
                                    password: ""
                                });
                            }}
                        >

                            {showRegister
                                ? " Login"
                                : " Register"}

                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // MAIN WEBSITE
    // ==========================================

    return (

        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo">

                    <div className="logo-icon">
                        💰
                    </div>

                    <div className="logo-text">

                        <h2>
                            Expense
                        </h2>

                        <span>
                            Tracker
                        </span>

                    </div>

                </div>


                <nav>

                    <button
                        className={
                            activePage ===
                            "Dashboard"

                                ? "nav-item active"

                                : "nav-item"
                        }

                        onClick={() =>
                            setActivePage(
                                "Dashboard"
                            )
                        }
                    >
                        🏠
                        <span>
                            Dashboard
                        </span>
                    </button>


                    <button
                        className={
                            activePage ===
                            "Expenses"

                                ? "nav-item active"

                                : "nav-item"
                        }

                        onClick={() =>
                            setActivePage(
                                "Expenses"
                            )
                        }
                    >
                        💳
                        <span>
                            Expenses
                        </span>
                    </button>


                    <button
                        className={
                            activePage ===
                            "Categories"

                                ? "nav-item active"

                                : "nav-item"
                        }

                        onClick={() =>
                            setActivePage(
                                "Categories"
                            )
                        }
                    >
                        📊
                        <span>
                            Categories
                        </span>
                    </button>


                    <button
                        className={
                            activePage ===
                            "Analytics"

                                ? "nav-item active"

                                : "nav-item"
                        }

                        onClick={() =>
                            setActivePage(
                                "Analytics"
                            )
                        }
                    >
                        📈
                        <span>
                            Analytics
                        </span>
                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <div className="profile">

                        <div className="avatar">

                            {user
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div className="profile-info">

                            <strong>
                                {user}
                            </strong>

                            <span>
                                Personal Account
                            </span>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* MAIN */}

            <main className="main">

                <header className="topbar">

                    <div>

                        <h1>
                            {activePage}
                        </h1>

                        <p>
                            Manage your money smarter.
                        </p>

                    </div>


                    <div className="date-display">

                        📅 {month}

                    </div>

                </header>


                {/* ==================================
                    DASHBOARD
                ================================== */}

                {activePage ===
                    "Dashboard" && (

                    <div className="page">

                        <div className="welcome">

                            <h2>
                                Welcome back, {user}! 👋
                            </h2>

                            <p>
                                Here's your spending overview.
                            </p>

                        </div>


                        <div className="stats">

                            <div className="stat-card purple">

                                <div className="stat-icon">
                                    💰
                                </div>

                                <div>

                                    <span>
                                        Total Spent
                                    </span>

                                    <h2>
                                        ₹
                                        {total.toFixed(2)}
                                    </h2>

                                    <small>
                                        This month
                                    </small>

                                </div>

                            </div>


                            <div className="stat-card blue">

                                <div className="stat-icon">
                                    🧾
                                </div>

                                <div>

                                    <span>
                                        Transactions
                                    </span>

                                    <h2>
                                        {expenses.length}
                                    </h2>

                                    <small>
                                        Total expenses
                                    </small>

                                </div>

                            </div>


                            <div className="stat-card green">

                                <div className="stat-icon">
                                    📅
                                </div>

                                <div>

                                    <span>
                                        Today's Spending
                                    </span>

                                    <h2>
                                        ₹
                                        {todayTotal.toFixed(2)}
                                    </h2>

                                    <small>
                                        Today
                                    </small>

                                </div>

                            </div>

                        </div>


                        <section className="dashboard-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        Recent Transactions
                                    </h2>

                                    <p>
                                        Your latest spending
                                    </p>

                                </div>


                                <button
                                    className="view-button"
                                    onClick={() =>
                                        setActivePage(
                                            "Expenses"
                                        )
                                    }
                                >
                                    View all →
                                </button>

                            </div>


                            {expenses.length ===
                            0 ? (

                                <div className="empty">

                                    <div>
                                        💸
                                    </div>

                                    <h3>
                                        No expenses yet
                                    </h3>

                                    <p>
                                        Add your first expense.
                                    </p>

                                </div>

                            ) : (

                                expenses
                                    .slice(0, 5)
                                    .map(
                                        expense => (

                                            <div
                                                className="expense"
                                                key={
                                                    expense.id
                                                }
                                            >

                                                <div className="icon">

                                                    {getIcon(
                                                        expense.category
                                                    )}

                                                </div>


                                                <div className="details">

                                                    <strong>
                                                        {
                                                            expense.description
                                                        }
                                                    </strong>

                                                    <p>
                                                        {
                                                            expense.category
                                                        }

                                                        {" • "}

                                                        {
                                                            expense.date
                                                        }
                                                    </p>

                                                </div>


                                                <strong>

                                                    ₹
                                                    {Number(
                                                        expense.amount
                                                    ).toFixed(2)}

                                                </strong>

                                            </div>

                                        )
                                    )

                            )}

                        </section>

                    </div>

                )}


                {/* ==================================
                    EXPENSES
                ================================== */}

                {activePage ===
                    "Expenses" && (

                    <div className="page">

                        <section className="dashboard-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        Add New Expense
                                    </h2>

                                    <p>
                                        Record your spending
                                    </p>

                                </div>

                            </div>


                            <form
                                onSubmit={
                                    addExpense
                                }
                            >

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Amount
                                        </label>

                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="₹ 0.00"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.amount
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Category
                                        </label>

                                        <select
                                            name="category"
                                            value={
                                                form.category
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option>
                                                Food
                                            </option>

                                            <option>
                                                Travel
                                            </option>

                                            <option>
                                                Shopping
                                            </option>

                                            <option>
                                                Bills
                                            </option>

                                            <option>
                                                Education
                                            </option>

                                            <option>
                                                Entertainment
                                            </option>

                                            <option>
                                                Other
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Description
                                    </label>

                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="What did you spend on?"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={
                                            form.date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <button
                                    className="primary-button"
                                    type="submit"
                                >
                                    + Add Expense
                                </button>

                            </form>

                        </section>


                        <section className="dashboard-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        All Transactions
                                    </h2>

                                    <p>
                                        {expenses.length}
                                        {" "}
                                        expenses
                                    </p>

                                </div>

                            </div>


                            {expenses.length ===
                            0 ? (

                                <div className="empty">

                                    <div>
                                        💸
                                    </div>

                                    <h3>
                                        No expenses yet
                                    </h3>

                                    <p>
                                        Add your first expense above.
                                    </p>

                                </div>

                            ) : (

                                expenses.map(
                                    expense => (

                                        <div
                                            className="expense"
                                            key={
                                                expense.id
                                            }
                                        >

                                            <div className="icon">

                                                {getIcon(
                                                    expense.category
                                                )}

                                            </div>


                                            <div className="details">

                                                <strong>
                                                    {
                                                        expense.description
                                                    }
                                                </strong>

                                                <p>
                                                    {
                                                        expense.category
                                                    }

                                                    {" • "}

                                                    {
                                                        expense.date
                                                    }
                                                </p>

                                            </div>


                                            <div className="expense-actions">

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        expense.amount
                                                    ).toFixed(2)}
                                                </strong>


                                                <button
                                                    onClick={() =>
                                                        deleteExpense(
                                                            expense.id
                                                        )
                                                    }
                                                >
                                                    🗑️
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </section>

                    </div>

                )}


                {/* ==================================
                    CATEGORIES
                ================================== */}

                {activePage ===
                    "Categories" && (

                    <div className="page">

                        <section className="dashboard-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        Spending by Category
                                    </h2>

                                    <p>
                                        See where your money goes.
                                    </p>

                                </div>

                            </div>


                            {categoryEntries.length ===
                            0 ? (

                                <div className="empty">

                                    <div>
                                        📊
                                    </div>

                                    <h3>
                                        No category data
                                    </h3>

                                    <p>
                                        Add some expenses first.
                                    </p>

                                </div>

                            ) : (

                                categoryEntries.map(
                                    ([category, value]) => (

                                        <div
                                            className="category-row"
                                            key={
                                                category
                                            }
                                        >

                                            <div className="category-left">

                                                <div className="icon">

                                                    {getIcon(
                                                        category
                                                    )}

                                                </div>

                                                <strong>
                                                    {category}
                                                </strong>

                                            </div>


                                            <strong>
                                                ₹
                                                {value.toFixed(2)}
                                            </strong>

                                        </div>

                                    )
                                )

                            )}

                        </section>

                    </div>

                )}


                {/* ==================================
                    ANALYTICS
                ================================== */}

                {activePage ===
                    "Analytics" && (

                    <div className="page">

                        <div className="analytics-stats">

                            <div className="analytics-card">

                                <span>
                                    Total Spent
                                </span>

                                <h2>
                                    ₹
                                    {total.toFixed(2)}
                                </h2>

                                <small>
                                    {month}
                                </small>

                            </div>


                            <div className="analytics-card">

                                <span>
                                    Average Expense
                                </span>

                                <h2>
                                    ₹
                                    {averageExpense.toFixed(2)}
                                </h2>

                                <small>
                                    Per transaction
                                </small>

                            </div>


                            <div className="analytics-card">

                                <span>
                                    Transactions
                                </span>

                                <h2>
                                    {expenses.length}
                                </h2>

                                <small>
                                    Total records
                                </small>

                            </div>

                        </div>


                        <section className="dashboard-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        🏆 Highest Spending Category
                                    </h2>

                                    <p>
                                        Your biggest spending area
                                    </p>

                                </div>

                            </div>


                            {highestCategory ? (

                                <div className="top-category">

                                    <div className="top-category-icon">

                                        {getIcon(
                                            highestCategory[0]
                                        )}

                                    </div>


                                    <div>

                                        <h2>
                                            {
                                                highestCategory[0]
                                            }
                                        </h2>

                                        <p>
                                            ₹
                                            {highestCategory[1].toFixed(
                                                2
                                            )}
                                            {" "}
                                            spent
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <div className="empty">

                                    <div>
                                        📊
                                    </div>

                                    <h3>
                                        No data yet
                                    </h3>

                                    <p>
                                        Add expenses to see analytics.
                                    </p>

                                </div>

                            )}

                        </section>


                        <section className="dashboard-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        Category Breakdown
                                    </h2>

                                    <p>
                                        How your spending is distributed
                                    </p>

                                </div>

                            </div>


                            {categoryEntries.map(
                                ([category, value]) => {

                                    const percentage =
                                        total > 0

                                            ? (
                                                  value /
                                                  total
                                              ) *
                                              100

                                            : 0;


                                    const barWidth =
                                        maxCategoryAmount >
                                        0

                                            ? (
                                                  value /
                                                  maxCategoryAmount
                                              ) *
                                              100

                                            : 0;


                                    return (

                                        <div
                                            className="analytics-row"
                                            key={
                                                category
                                            }
                                        >

                                            <div className="analytics-row-top">

                                                <div className="category-left">

                                                    <div className="icon">

                                                        {getIcon(
                                                            category
                                                        )}

                                                    </div>

                                                    <strong>
                                                        {category}
                                                    </strong>

                                                </div>


                                                <div className="analytics-value">

                                                    <strong>
                                                        ₹
                                                        {value.toFixed(
                                                            2
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {percentage.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="progress-background">

                                                <div
                                                    className="progress-bar"
                                                    style={{
                                                        width:
                                                            `${barWidth}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </section>

                    </div>
                )}

            </main>

        </div>
    );
}


export default App;