# DG Retail App — Frontend Client
**Production-Ready React Native & Expo Router Mobile Application**

For the complete technical, architectural, and operational documentation, see:
👉 **[DG_APP_TECHNICAL_DOCUMENTATION.md](../DG_APP_TECHNICAL_DOCUMENTATION.md)**

---

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. Type-check the project:
   ```bash
   npx tsc --noEmit
   ```


## Testing authentication and API access

The app uses the deployed API (`https://dgapp-vu9a.onrender.com/api`) in development and production by default, so you do not need to run the backend locally. Your phone or emulator must have internet access. The first request can take longer if the hosted API is waking up.

To use a different API, set `EXPO_PUBLIC_API_URL` before starting Expo. For example, in PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL = "https://your-api.example.com/api"
npx expo start
```

Use a publicly reachable HTTPS URL for a packaged app. `EXPO_PUBLIC_` values are embedded in the client app and must not contain secrets. Expo's development server is still needed to load the app during local testing; no local backend server is needed.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
