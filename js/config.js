/*
 * ===================================================================
 *  DRAPE settings – this is the ONLY file you need to edit.
 * ===================================================================
 *
 *  FIREBASE (accounts + your saved wardrobe) – free Spark plan, no card.
 *     Firebase console › ⚙ Project settings › General › "Your apps"
 *     › Web app (</>) › "SDK setup and configuration" › Config.
 *     Copy apiKey and appId between the quotes below (README step 2).
 *     These values are NOT secret – they are safe on GitHub.
 *
 *  TRY-ON AI – free, nothing to set up.
 *     DRAPE uses the free public IDM-VTON demo on Hugging Face.
 *     If it ever closes, put the name of another copy of it here
 *     (for example 'someone/IDM-VTON'). See README, "Good to know".
 */
window.DRAPE_CONFIG = {
  firebase: {
    apiKey: 'AIzaSyD3LmimWZxP49sXWW3AG3fL1t6P7Hz1AGs',
    authDomain: 'clothes-try-66e2f.firebaseapp.com',
    databaseURL: 'https://clothes-try-66e2f-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'clothes-try-66e2f',
    appId: '1:160181048952:web:44887cfdd34b16bc9a3f8d',
  },

  tryOnSpace: 'yisol/IDM-VTON',
};
