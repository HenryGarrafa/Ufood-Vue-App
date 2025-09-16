# 🍽️ UFood – Restaurant Finder App

A Vue.js application developed as part of the **GLO-3102 Web Application Development** course at Université Laval.  
This app allows users to explore restaurants, manage favorites, log visits, and connect with other users.  

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/HenryGarrafa/UFood-Vue-App.git
cd UFood-Vue-App
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

The app will start on [http://localhost:5173](http://localhost:5173) by default.  
⚠️ If port `5173` is busy, Vite will automatically use another port (e.g., 5174, 5175).  
Check your terminal output for the exact address.  

---

## 🧭 Main Features

### 🔹 Home Page `/`
- Dynamic list of restaurants.  
- Add/remove restaurants from **favorites**.  
- Mark restaurants as **visited** with comment, rating, and date.  
- Autocomplete search bar for quick filtering.  
- Filters: cuisine type, price range, sorting options.  
- Switch between **list view** and **map view**.  

### 🔹 Restaurant Page `/restaurant/:id`
- View detailed restaurant info.  
- Add favorites and log visits.  
- View similar restaurant suggestions.  
- Display route on map + open in Google Maps.  
- Carousel for restaurant images.  

### 🔹 User Profile `/user` or `/user/:id`
- View visits, favorites, followers, and following.  
- Create, edit, or delete favorite lists.  
- Filter restaurants and visits (by type, price, rating, or date).  
- Follow/unfollow other users.  

### 🔹 Users Page `/users`
- Search for users with autocomplete.  
- View profiles, follow/unfollow options.  

### 🔹 Login Page `/login`
- Create a new account (name, email, password).  
- Login with existing account.  
- Demo credentials:  
  - **Email:** `courriel@gmail.com`  
  - **Password:** `test01`  

---

## 📂 Project Structure
```
UFood-Vue-App/
├── public/              # Static assets
├── src/                 # Main source code
│   ├── components/      # Vue components
│   ├── pages/           # App pages
│   └── assets/          # Images, styles
├── package.json         # Dependencies & scripts
├── vite.config.js       # Vite configuration
└── README.md            # Documentation
```

---

## ⚡ Technologies Used
- [Vue.js 3](https://vuejs.org/) (Frontend framework)  
- [Vite](https://vitejs.dev/) (Build tool & dev server)  
- [JavaScript (ES6+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)  
- [Node.js](https://nodejs.org/) (Runtime for development)  

---

## 📝 Notes
- Requires **Node.js** installed on your system.  
- Recommended browser: **Google Chrome**.  
