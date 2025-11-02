
# Drift: An Endless Present

<div align="center">
  <img src="https://raw.githubusercontent.com/harshrajsinhraulji/drift-an-endless-present/main/public/assets/images/titlescreen.png" alt="Drift Title Screen" width="600"/>
</div>

<p align="center">
  <em>An interactive story of survival, where every choice shapes the destiny of a forgotten kingdom.</em>
</p>

---

## 🏜️ About The Game

**Drift: An Endless Present** is a minimalist, card-based narrative strategy game where you assume the role of a ruler in a timeless, forgotten land. Presented with a series of dilemmas and events, you must make choices that impact the four pillars of your kingdom: the **Environment**, the **People**, the **Army**, and the **Treasury**.

The core of the game is balance. Your goal is not to conquer or expand, but to survive. Each decision you make, a simple swipe left or right, can lead your kingdom toward prosperity or ruin. The narrative unfolds based on your choices, revealing new characters, challenges, and branching storylines. Can you navigate the treacherous currents of fate and lead your kingdom to a Golden Age, or will your reign be lost to the endless sands of time?

## ✨ Features

- **Interactive Narrative:** A rich, branching story with dozens of unique characters and events.
- **Simple Controls, Complex Choices:** An intuitive swipe-based interface (or arrow keys) makes decisions accessible, but their consequences are deep and often unpredictable.
- **Resource Management:** Juggle four key resources. If any one of them reaches zero or one hundred, your reign ends.
- **Dynamic Storytelling:** The text on the cards adapts based on the state of your kingdom, making the world feel alive and responsive.
- **Multiple Endings:** Discover various game-over scenarios, from popular uprisings to economic collapse, and strive for special endings like the coveted Golden Age.
- **Achievements & Leaderboards:** Track your greatest accomplishments and see how your reign compares to other rulers with persistent achievements and a global leaderboard.
- **Persistent Saves:** Create an account to save your progress and continue your reign across sessions. Or, play as a "Wanderer" in anonymous mode.

## 🎮 How to Play

1.  **Become the Ruler:** Start a new game by signing in or choosing to "Enter the Drift" for anonymous play. Authenticated users' progress is saved automatically.
2.  **Face Your Dilemma:** You will be presented with a card representing a character or event in your kingdom. Read the situation carefully.
3.  **Make Your Choice:**
    -   **Swipe Right** or press the **Right Arrow Key** to choose the option on the right.
    -   **Swipe Left** or press the **Left Arrow Key** to choose the option on the left.
4.  **Observe the Consequences:** After each choice, you will see how your four main resources are affected. Small dots will appear above the resource icons—green for an increase, red for a decrease.
5.  **Maintain Balance:** Keep a close eye on your resources at the top of the screen. The vertical bars represent the current level (from 0 to 100). If any bar empties or fills completely, your game is over.
6.  **Survive:** Your goal is to rule for as many years as possible. Each choice progresses time. The longer you last, the higher your score on the "Longest Dynasty" leaderboard.

## 🛠️ Local Setup and Installation

Follow these instructions to get a local copy of the project up and running for development or personal use.

### Prerequisites

-   [Node.js](httpss://nodejs.org/) (v18.x or later recommended)
-   [npm](httpss://www.npmjs.com/) (usually comes with Node.js)
-   A [Firebase](httpss://firebase.google.com/) project.

### 1. Clone the Repository

First, clone this repository to your local machine.

```bash
git clone https://github.com/harshrajsinhraulji/drift-an-endless-present.git
cd drift-an-endless-present
```

### 2. Install Dependencies

Install all the required npm packages.

```bash
npm install
```

### 3. Set Up Firebase

This project uses Firebase for authentication and database (Firestore) services.

1.  **Create a Firebase Project:** Go to the [Firebase Console](httpss://console.firebase.google.com/) and create a new project.
2.  **Register a Web App:** Inside your project, click the `</>` icon to add a new web app. Give it a nickname and register the app.
3.  **Get Firebase Config:** After registering, Firebase will provide you with a `firebaseConfig` object. You will need these values.
4.  **Enable Authentication:** In the Firebase Console, go to **Build > Authentication**. Click "Get Started" and enable the **Email/Password** and **Google** sign-in providers. Also enable **Anonymous** sign-in.
5.  **Set Up Firestore:** Go to **Build > Firestore Database**. Click "Create database," start in **Production mode**, and choose a location.
6.  **Configure Security Rules:** In the Firestore Database tab, go to **Rules**. Copy the contents of the `firestore.rules` file from this repository and paste them into the editor. Click **Publish**.

### 4. Configure Environment Variables

You need to provide your Firebase project credentials to the application.

1.  Create a new file named `.env.local` in the root of the project.
2.  Copy the contents of `.env.example` into your new `.env.local` file.
3.  Fill in the values for each variable using the `firebaseConfig` object you obtained in the previous step. It should look like this:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
    ```

### 5. Run the Development Server

You're all set! Start the Next.js development server.

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## 🙏 Credits & Acknowledgements

This game was conceptualized, designed, and developed by **Harshrajsinh Raulji**.

-   **GitHub:** [@harshrajsinhraulji](httpss://github.com/harshrajsinhraulji)
-   **LinkedIn:** [Harshrajsinh Raulji](httpss://www.linkedin.com/in/harshrajsinhraulji/)

The project was built using the following amazing technologies:
-   [Next.js](httpss://nextjs.org/)
-   [React](httpss://react.dev/)
-   [Firebase](httpss://firebase.google.com/)
-   [Tailwind CSS](httpss://tailwindcss.com/)
-   [Shadcn/ui](httpss://ui.shadcn.com/)
-   [Lucide React](httpss://lucide.dev/) for icons.

This project was built in **Firebase Studio**, an AI-assisted development environment.
