from django.contrib.auth import authenticate
from django.db.models import Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense
from .serializers import (
    ExpenseSerializer,
    RegisterSerializer
)


# ==========================================
# REGISTER
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    serializer = RegisterSerializer(
        data=request.data
    )

    if serializer.is_valid():

        user = serializer.save()

        token, created = Token.objects.get_or_create(
            user=user
        )

        return Response(
            {
                "message": "Registration successful",
                "username": user.username,
                "token": token.key
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ==========================================
# LOGIN
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:

        return Response(
            {
                "error":
                "Username and password are required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(
        username=username,
        password=password
    )

    if user is None:

        return Response(
            {
                "error":
                "Invalid username or password"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    token, created = Token.objects.get_or_create(
        user=user
    )

    return Response(
        {
            "message": "Login successful",
            "username": user.username,
            "token": token.key
        }
    )


# ==========================================
# EXPENSE LIST + ADD
# ==========================================

class ExpenseView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        expenses = Expense.objects.filter(
            user=request.user
        ).order_by(
            "-date",
            "-id"
        )

        serializer = ExpenseSerializer(
            expenses,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = ExpenseSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# DELETE EXPENSE
# ==========================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_expense(request, expense_id):

    try:

        expense = Expense.objects.get(
            id=expense_id,
            user=request.user
        )

    except Expense.DoesNotExist:

        return Response(
            {
                "error":
                "Expense not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    expense.delete()

    return Response(
        {
            "message":
            "Expense deleted successfully"
        }
    )


# ==========================================
# MONTHLY TOTAL
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_total(request):

    today = timezone.localdate()

    total = Expense.objects.filter(
        user=request.user,
        date__year=today.year,
        date__month=today.month
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    return Response(
        {
            "month":
            today.strftime("%B %Y"),

            "total":
            total
        }
    )