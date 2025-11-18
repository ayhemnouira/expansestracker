# 💰 ExpensesTracker - Smart Personal Finance Manager

A modern, full-stack financial management application built with **Spring Boot** and **React** that helps users track expenses, manage budgets, and gain insights into their spending habits with intelligent alerts and beautiful visualizations.

![ExpensesTracker Dashboard](screenshots/dashboard.png)

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** with access & refresh tokens
- Secure password encryption with BCrypt
- Session management with token refresh mechanism
- Protected API endpoints with Spring Security

### 📊 Dashboard & Analytics
- **Real-time financial overview** with interactive charts
- Monthly expense tracking with trend analysis
- Account balance visualization (Recharts/Chart.js)
- Category-wise spending breakdown
- Transaction history timeline

### 💳 Transaction Management
- Add, edit, and delete transactions (Income/Expense)
- Multiple account support (Checking, Savings, Credit)
- Category classification (Food, Transport, Shopping, etc.)
- Receipt upload and document attachment (PDF, JPG, PNG)
- Advanced search and filtering

### 🎯 Budget Management
- **Smart budget tracking** with 12+ categories
- Real-time spending progress indicators
- **Intelligent alerts** at 80% and 100% budget thresholds
- Monthly/Weekly/Custom period budgets
- Visual budget vs. actual spending comparison

### 🏦 Account Management
- Multiple account support (Bank accounts, Credit cards, Cash)
- Track balances across all accounts
- Enable/Disable accounts
- Account type categorization (Depository, Credit, Investment)

### 📁 Document Management
- Upload receipts and financial documents
- Link documents to specific transactions
- Support for PDF, JPG, PNG (Max 5MB)
- Document preview and download

### 🌓 User Experience
- **Dark/Light mode** toggle
- Fully responsive design (Mobile, Tablet, Desktop)
- Smooth animations and transitions
- Clean, modern Material-UI interface
- Real-time notifications and alerts

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.x** - Application framework
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication
- **PostgreSQL** - Relational database
- **Hibernate/JPA** - ORM
- **Maven** - Dependency management
- **RESTful API** - Clean API design

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** - UI component library
- **Recharts/Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation
- **Vite** - Build tool

### Deployment & DevOps
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** PostgreSQL (Railway)
- **Version Control:** Git/GitHub

## 📸 Screenshots

### Dashboard
![Dashboard Light Mode](screenshots/dashboard-light.png)
![Dashboard Dark Mode](screenshots/dashboard-dark.png)

### Transactions
![Transactions Page](screenshots/transactions.png)
![New Transaction Form](screenshots/transaction-form.png)

### Budget Management
![Budget Overview](screenshots/budgets.png)
![Budget Alerts](screenshots/budget-alerts.png)

### Account Management
![Accounts Page](screenshots/accounts.png)

## 🚀 Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Maven 3.8+**

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ExpensesTracker.git
cd ExpensesTracker/backend
```

2. **Configure database**
Create `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/expensestracker
spring.datasource.username=your_username
spring.datasource.password=your_password

jwt.secret=your-secret-key-here
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

3. **Run the application**
```bash
./mvnw clean install
./mvnw spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create `.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

4. **Run development server**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}` - Download document

## 🎯 Key Features Explained

### Smart Budget Alerts
The system monitors your spending in real-time and sends notifications:
- **⚠️ 80% Alert**: Warning when you reach 80% of your budget
- **🚨 100% Alert**: Critical alert when budget is exceeded

### JWT Authentication Flow
```
1. User logs in → Server validates credentials
2. Server generates JWT access token (24h) + refresh token (7d)
3. Client stores tokens securely
4. Protected requests include access token
5. When token expires → Use refresh token to get new access token
```

### Multi-Account System
Track finances across multiple accounts:
- Bank checking accounts
- Savings accounts
- Credit cards
- Cash wallets

## 📦 Project Structure
```
ExpensesTracker/
├── backend/
│   ├── src/main/java/com/expensestracker/
│   │   ├── config/          # Security, JWT config
│   │   ├── controller/      # REST controllers
│   │   ├── model/           # Entity models
│   │   ├── repository/      # JPA repositories
│   │   ├── service/         # Business logic
│   │   └── security/        # JWT utilities
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API services
│   │   ├── context/         # React context
│   │   └── types/           # TypeScript types
│   └── package.json
│
└── README.md
```

## 🔒 Security Features

- Password hashing with BCrypt
- JWT token authentication
- CORS configuration
- SQL injection prevention (JPA)
- XSS protection
- Secure HTTP headers

## 🌐 Live Demo

🔗 **[View Live Application](your-vercel-url.vercel.app)**

### Test Credentials
```
Email: demo@expensestracker.com
Password: Demo123!
```

## 📈 Future Enhancements

- [ ] AI-powered expense predictions
- [ ] OCR for receipt scanning
- [ ] Export reports (PDF/CSV)
- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Email notifications
- [ ] Financial goal tracking
- [ ] Bank account integration (Plaid API)

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- Recharts for data visualization
- Spring Boot community for excellent documentation
- All open-source contributors

---

⭐ **Star this repository if you found it helpful!**

📫 **Questions?** Feel free to reach out or open an issue!
