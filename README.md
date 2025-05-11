# 🎉 Event Manager for 42 Community

Welcome to **Event Manager**, a sleek and modern web app designed for the 42 community to discover, subscribe, and manage events effortlessly. Built using **Next.js & Supabase**, it features **real-time sync, admin controls, dynamic UI enhancements, and intuitive navigation**.

## 🚀 Implemented Features

### ✅ **Easy Features**

-   🎨 **Intuitive UI** – Clean, consistent, and fully responsive.
-   📅 **Events List** – Displays at least **3 upcoming events** with title & date.
-   📝 **Event Details** – Shows full event description.
-   📱 **Responsive Design** – Works flawlessly across screen sizes with **no console errors**.

### ⚡ **Intermediate Features**

-   🔒 **Protected Admin Page** – `/admin` is **blocked for logged-out users**.
-   ➕ **Create Events** – Admins can **add events live**, appearing instantly.
-   ✏️ **Edit Events** – Updates **reflect dynamically** without refresh.
-   ❌ **Delete Events** – Events **stay deleted** after page reload.
-   🔍 **Live Search & Filter** – Events list **updates instantly** as users type.

### 🔥 **Hard Features**

-   🔄 **Real-time Sync Between Tabs** – Changes are **instantly reflected across open tabs**.
-   📂 **Supabase Subscriptions** – Ensures smooth **event updates without manual refresh**.
-   📊 **Bulk CSV import** - Admins can import events from a CSV file.

### 🔥 **Advanced Features**

-   💬 **Live Notifications** - Users get notified when a new event is created.

### 🎖️ **Bonus**

-   🔗 **Public GitHub Repo with README**
-   🌎 **Live Deployment** – Hosted version linked below in project description.
-   ✨ **UI Enhancements** – Custom **rounded styling**, **glassmorphism navbar**, & refined **spacing**.

## 🛠️ Tech Stack

-   **Frontend:** Next.js, Tailwind CSS
-   **Backend:** Supabase (Auth, Database, Realtime)
-   **Tools:** TypeScript, React Table, Shadcn UI

## 🚀 Deployment & Setup

### **💻 Local Setup**

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/event-manager.git
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Create `.env.local` file containing your following keys:
    ```sh
     NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
    ```
4. Run the app
    ```sh
    npm run dev
    ```
5. Suffer like a true programmer.
    ```sh
    kill -9 $YOUR_NAME
    ```
