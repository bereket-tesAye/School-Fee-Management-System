# School Fee Management System

A web-based fee management platform for schools in Ethiopia. This system digitizes fee tracking, payment proof verification, and payment confirmations for parents and school staff.

**Status:** ✅ Complete prototype | **Built in:** 1 week | **Purpose:** University capstone project

---

## 🎯 Features Implemented

### Admin Dashboard
- ✅ Manage students and classes
- ✅ Create and track invoices (bills)
- ✅ Record payments (3 channels: cash, bank receipt, mobile banking)
- ✅ Verify pending payments against bank statements
- ✅ Automatic email confirmation to parents when payment is confirmed
- ✅ Dashboard showing key metrics (total collected, outstanding, collection rate)
- ✅ View complete payment history and audit trail

### Parent Portal
- ✅ Parent registration and login
- ✅ View child's outstanding invoices
- ✅ Submit payment proof (bank reference number or screenshot)
- ✅ Track payment history
- ✅ Receive email confirmation once payment is verified

### Payment Channels
The system supports **3 real payment methods** that schools in Ethiopia actually use:

1. **Cash at School** — instant confirmation, no verification needed
2. **Bank Receipt (in-person)** — staff checks against bank statement
3. **Mobile Banking** — parent uploads screenshot, staff verifies

---

## 🏗️ System Architecture

```
┌─────────────────────┐
│   React Frontend    │  (Parent & Admin UI)
└──────────┬──────────┘
           │
    HTTP API (REST)
           │
┌──────────▼──────────┐
│  Django Backend     │  (API endpoints, business logic)
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   MySQL Database    │  (Students, invoices, payments)
└─────────────────────┘
           │
        SMTP ──────► Gmail (Email notifications)
```

**Tech Stack:**
- **Frontend:** React + Axios
- **Backend:** Django + Django REST Framework
- **Database:** MySQL
- **Email:** Gmail SMTP
- **Hosting:** Can deploy to Render, Railway, Vercel

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- MySQL 8.0+
- Gmail account (for email notifications)

### Step 1: Clone & Setup Backend

```bash
# Navigate to project
cd School_Fee_Managment_System

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install django djangorestframework pymysql pillow django-cors-headers

# Create database in MySQL Workbench
# CREATE DATABASE schoolfees_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Update schoolfees/settings.py with your MySQL credentials:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'schoolfees_db',
#         'USER': 'root',
#         'PASSWORD': 'your-mysql-password',
#         ...
#     }
# }

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start Django server
python manage.py runserver
# Visit: http://127.0.0.1:8000/api/
```

### Step 2: Setup Frontend

```bash
cd frontend
npm install
npm start
# Visit: http://localhost:3000
```

---

## 🚀 First-Time Setup: Create Test Data

### 1. Create a Class & Student (Admin Portal)

1. Go to **http://localhost:3000**
2. Click **Students** → Add a class (e.g., "Grade 7B", "Term 1 2025/26")
3. Add a student with guardian details (name, phone, email)

### 2. Create an Invoice

1. Click **Invoices** → Select student and amount
2. Invoice automatically gets a unique reference code

### 3. Create & Verify a Payment

1. Click **Payments**
2. Select invoice and choose payment channel:
   - **Cash:** Instantly marked paid
   - **Bank/Mobile:** Goes to "Pending Verification"
3. Click **Confirm** — email automatically sends to parent

### 4. Parent Register & Login

1. Click navbar → **Parent Login**
2. Click **Register here** → Select your profile (the guardian you created)
3. Set email and password
4. Log in to see your child's invoices
5. Click **Pay Now** to submit payment proof

---

## 📧 Email Configuration

### Using Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on Gmail account
2. Go to **myaccount.google.com → Security → App passwords**
3. Generate a password for "Mail" + "Windows Computer"
4. Update `schoolfees/settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # 16-char app password
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'
```

5. When staff confirms a payment, parent receives email automatically

---

## 🧪 Testing Checklist

### Admin Workflow
- [ ] Create a class
- [ ] Add 2+ students with different guardians
- [ ] Create invoices for each student
- [ ] Record a cash payment (should instantly confirm)
- [ ] Record a bank receipt payment (should go to pending)
- [ ] Record a mobile banking payment with screenshot
- [ ] Confirm bank/mobile payments (email should send)
- [ ] Check Dashboard totals

### Parent Workflow
- [ ] Parent registers using "Register" link
- [ ] Parent logs in
- [ ] Parent sees their child's unpaid invoices
- [ ] Parent submits bank reference payment
- [ ] Parent uploads mobile banking screenshot
- [ ] Parent checks payment history
- [ ] Receives email once admin confirms

### Payment Email
- [ ] Email shows correct student name
- [ ] Email shows correct invoice reference code
- [ ] Email shows correct amount paid
- [ ] Email shows payment method
- [ ] Email arrives within 2 minutes of confirmation

---

## 📊 Database Schema

### Core Tables

**Class**
- id, name, term

**Student**
- id, full_name, student_class_id

**Guardian**
- id, student_id, full_name, phone, email

**Invoice**
- id, student_id, reference_code, amount_due, month, status, created_at

**Payment**
- id, invoice_id, amount_paid, channel, bank_reference, receipt_image, status, verified_by, verified_at

**ParentUser**
- id, guardian_id, email, password, token, created_at

**AdminUser**
- id, name, role, email

---

## 🔐 User Roles

### Admin (Staff)
- Access: Full dashboard
- Can: Create students/invoices, verify payments, see all data
- No login needed (internal use only)

### Parent
- Access: Parent portal only
- Can: View child's balance, submit payment proof
- Login: Email + password

---

## 🛣️ API Endpoints

All endpoints prefixed with `/api/`

### Public
- `POST /parent/login/` — Parent login
- `POST /parent/register/` — Parent registration

### Admin (no auth required in demo)
- `GET/POST /classes/`
- `GET/POST /students/`
- `GET/POST /invoices/`
- `GET/POST /payments/`
- `POST /payments/{id}/confirm/` — Confirm payment & send email
- `POST /payments/{id}/reject/` — Reject payment

### Parent (requires token)
- `GET /parent/invoices/` — View own invoices
- `GET/POST /parent/payments/` — View/submit own payments

---

## 🚨 Common Issues & Fixes

### Parent can't see invoices
**Problem:** Invoices not showing in parent dashboard
**Fix:** 
1. Go to Django shell: `python manage.py shell`
2. Check: `Student.objects.filter(guardians__id=5)` (use correct guardian ID)
3. Make sure that student has invoices with status != 'paid'

### Email not sending
**Problem:** No confirmation email when payment is confirmed
**Fix:**
1. Check `schoolfees/settings.py` — Gmail credentials correct?
2. Django terminal should show email was sent
3. Check Gmail spam folder
4. Enable "Less secure apps" if using older Gmail setup

### Parent login says "Email not found"
**Problem:** Parent account doesn't exist
**Fix:** Run parent registration flow, or use Django shell to create manually

---

## 🔮 Future Enhancements

These features are designed into the system but not implemented (good for future versions):

- **SMS Notifications** — Use AfroMessage or GeezSMS for parent SMS alerts
- **Payment Gateway Integration** — Chapa or ArifPay for direct app payments
- **Multi-School Support** — SaaS model for multiple schools
- **Reports & Analytics** — Export payment reports, fee summaries
- **Partial Payments** — Track installment plans
- **Mobile App** — Native Android/iOS apps
- **Admin User Management** — Multiple staff accounts with roles
- **Fee Template System** — Create fee structures once, apply to all classes

---

## 📝 Project Structure

```
School_Fee_Managment_System/
│
├── schoolfees/                 # Django project settings
│   ├── settings.py             # Database, email config
│   ├── urls.py                 # Main URL router
│   └── wsgi.py                 # Production deployment
│
├── fees/                        # Django app
│   ├── models.py               # Database tables
│   ├── views.py                # API logic
│   ├── serializers.py          # API serializers
│   ├── urls.py                 # API routes
│   └── admin.py                # Django admin
│
├── frontend/                    # React app
│   ├── src/
│   │   ├── pages/              # Login, Dashboard, Students, etc.
│   │   ├── layouts/            # AdminLayout, ParentLayout
│   │   ├── api/                # API connector (axios)
│   │   └── App.js              # Main router
│   └── package.json
│
├── manage.py                   # Django CLI
└── venv/                       # Virtual environment
```

---

## 👨‍💼 For School Administrators

### How This Improves Your School

1. **Faster Payments** — Parents can pay anytime, anywhere (bank or mobile)
2. **Better Record Keeping** — Automatic digital records, no lost receipts
3. **Fewer Disputes** — Parents get instant email confirmation
4. **Time Savings** — Staff doesn't manually track payments
5. **Transparency** — Parents can check balance anytime
6. **Collection Rate** — Easy to see who paid and who hasn't

### Deployment Recommendation

For a real school, host this on:
- **Backend:** Render.com (free tier available)
- **Database:** Render PostgreSQL (free)
- **Frontend:** Vercel.com (free)
- **Email:** Gmail business account or SendGrid

Total cost: $0-50/month depending on usage

---

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack web development (Django + React)
- ✅ RESTful API design
- ✅ Database modeling
- ✅ Authentication & authorization
- ✅ Email integration
- ✅ Real-world problem solving
- ✅ Agile development (1-week sprint)

---

## 📞 Support & Questions

For questions about the system:
1. Check the README first (you're reading it!)
2. Review the code comments in `fees/views.py` and React pages
3. Check Django shell to verify database state
4. Look at browser Network tab to see API requests/responses

---

## 📜 License

This is a university capstone project created for learning purposes.

---

**Built with ❤️ for Ethiopian schools**

Last updated: July 2026
