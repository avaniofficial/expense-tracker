from django.urls import path

from .views import (
    register,
    login,
    ExpenseView,
    delete_expense,
    monthly_total
)


urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("expenses/", ExpenseView.as_view()),
    path("expenses/<int:expense_id>/", delete_expense),
    path("monthly-total/", monthly_total),
]