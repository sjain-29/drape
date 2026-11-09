# DRAPE: your wardrobe, with AI try-on

DRAPE is a website you open on your phone or computer. You photograph your clothes, DRAPE turns them into clean product pictures, and you can see outfits on a photo of yourself.

This version is plain HTML, CSS and JavaScript. There's nothing to install and no build step. You upload the folder to GitHub and it runs.

## What you can do with each part set up

| You set up | You get | Cost |
|---|---|---|
| Nothing (open the site, tap **Try the demo**) | Every screen works, but nothing is saved | Free |
| **Step 1:** GitHub Pages | Your own web address for DRAPE | Free |
| **Step 2:** Firebase | Accounts, and your photos, clothes and outfits saved privately | Free (Spark plan, no card) |
| Nothing extra | Background removal, Extract Clothes, Overlay try-on and the stylist. These run inside your browser | Free |
| Nothing extra | **Free AI** try-on for tops, using a public AI demo on Hugging Face | Free, with a small daily limit |

There is no server to set up and nothing to pay for.

## What's in this folder

| File | What it is | Do you edit it? |
|---|---|---|
| `index.html` | The page | No |
| `js/config.js` | **Your settings** (Firebase, and which free try-on AI to use) | **Yes, this is the only one** |
| `js/app.js` | All the screens and buttons | No |
| `js/store.js` | Sign-in and saving | No |
| `js/images.js` | Photo handling and the AI features | No |
| `js/data.js` | Clothing categories, colours and styling rules | Only if you want to change the lists |
| `css/styles.css` | Colours, fonts and layout | Only if you want to change the look |
| `firebase-rules.json` | Security rules you paste into Firebase | No, just copy it |
| `sw.js` | Clears the old version from browsers that cached it | No |

---

## Step 1: Put DRAPE on the internet (GitHub Pages, about 5 minutes)

1. Sign in to [github.com](https://github.com). Click **+** (top right) › **New repository**.
2. Name it `drape`. Choose **Public** (free GitHub Pages needs a public repository). Click **Create repository**.
3. On the new page, click **uploading an existing file**.
4. Open the `drape-simple` folder on your computer. Select **everything inside it** (`index.html`, `css`, `js`, `assets` and the rest) and drag it into the GitHub page. `index.html` must be at the top level, not inside another folder.
5. Click **Commit changes**.
6. Go to **Settings** › **Pages**. Under **Build and deployment** › **Source**, choose **Deploy from a branch**. Under **Branch**, choose **main** and **/ (root)**, then **Save**.
7. Wait 1 to 2 minutes and refresh that Settings page. Your address appears at the top, for example `https://yourname.github.io/drape/`.
8. Open it and tap **Try the demo without an account**.

> **Already uploaded the earlier DRAPE version to this repository?** Delete its files first (or use a new repository), and make sure **Source** is set to **Deploy from a branch**, not **GitHub Actions**. If your browser still shows the old version, reload the page once more. The included `sw.js` removes the old offline copy.

**Is it safe that the repository is public?** Yes. Nothing secret goes in these files. The Firebase settings in `config.js` are meant to be public; your data is protected by the security rules in Step 2.

---

## Step 2: Accounts and saving (Firebase, about 10 minutes)

You already have a Firebase project called `clothes-try-66e2f` with a Realtime Database. Now connect DRAPE to it.

### 2a. Copy two values into `config.js`
1. Open [console.firebase.google.com](https://console.firebase.google.com) and click your project.
2. Click the **gear icon** › **Project settings** › **General**. Scroll to **Your apps**.
3. If there's no web app yet, click the **`</>`** (Web) button, type the nickname `DRAPE`, leave Hosting unticked and click **Register app**.
4. You'll see a block that starts with `const firebaseConfig = {`. Find `apiKey` and `appId`.
5. In GitHub, open `js/config.js` and click the **pencil icon** (Edit). Replace `PASTE_YOUR_API_KEY` and `PASTE_YOUR_APP_ID` with your values. Keep the quote marks around them.
6. Click **Commit changes**.

### 2b. Switch on sign-in
1. In Firebase: **Build** › **Authentication** › **Get started**.
2. **Sign-in method** tab › **Email/Password** › turn on the first switch › **Save**.
3. **Add new provider** › **Google** › turn it on › pick your email as the support email › **Save**.
4. **Settings** tab › **Authorized domains** › **Add domain** › type `yourname.github.io` (no `https://`, no `/drape`) › **Add**.

### 2c. Protect the database
1. In Firebase: **Build** › **Realtime Database** › **Rules** tab.
2. Delete everything in the box. Open `firebase-rules.json` from this folder, copy all of it and paste it in.
3. Click **Publish**.

These rules mean each person can only see and change their own wardrobe. Nobody else, including other DRAPE users, can read it.

### 2d. Try it
Reload your DRAPE site and create an account. Open the link in the verification email, then tap **I've verified** in DRAPE.

**Free plan limits:** the Realtime Database gives you 1 GB of storage and about 10 GB of downloads a month. DRAPE shrinks every picture before saving (roughly 100–300 KB each), so that's a few thousand pictures.

---

## Virtual try-on: two free ways

Open **Virtual Try-On** and choose **How to try it on**:

**Free AI** dresses your photo with a real AI model (IDM-VTON), run for free by its researchers on Hugging Face.
- It changes **tops only** (shirts, t-shirts, sweaters, jackets).
- The first time, DRAPE asks your permission, because your photo and the top are sent to that public service. You can switch it off in **Settings**.
- It usually takes 1–3 minutes. If many people are using it you wait in a queue, and sometimes it's asleep and needs a minute to wake up.
- Hugging Face gives free GPU time per day: about 2 minutes without an account, about 5 minutes with a free account. Each try-on uses up to a minute, so that's **roughly 2 tries a day, or about 5 with a free token** (see below).
- If it fails, DRAPE tells you why and saves nothing. Use **Overlay** instead.

**Overlay** works for tops, bottoms and dresses, instantly, and nothing leaves your device. DRAPE places the garment pictures on your photo; you drag them into place and use the sliders to size, turn and stretch them, then **Save this look**. It looks like a neat collage, not a photo, and it's always labelled **Overlay (not AI)**.

### More free AI tries (optional)
1. Create a free account at [huggingface.co/join](https://huggingface.co/join).
2. Go to **Settings › Access Tokens › Create new token**. Choose **Read**, give it any name, and create it.
3. Copy the token (it starts with `hf_`). In DRAPE, open **Settings**, paste it into **Hugging Face token**, and tap **Save token**.

The token is kept only in that browser, never in GitHub or your database. Add it again on each phone or computer you use.

---

## Using DRAPE

- **My Profile:** add a full-body photo (head to toe, facing the camera, good light). The one marked **Try-on photo** is used for try-on.
- **My Wardrobe › Add clothes:** photograph each garment flat or hanging against a plain wall. You can pick several photos at once. Check the name and category, then **Save to wardrobe**.
- **Extract Clothes:** upload a photo of someone wearing an outfit. DRAPE separates the top, bottom, dress and shoes into individual items you can add.
- **Virtual Try-On:** pick **Free AI** (tops) or **Overlay** (anything). Results are saved automatically. Use **Compare with › Original** to slide between before and after.
- **AI Stylist:** pick an occasion and style. Suggestions only use clothes you own.
- **Saved Outfits:** your kept looks and every generated picture.
- **Install on your phone:** iPhone: Share › **Add to Home Screen**. Android: browser menu › **Install app**.

## Good to know

- **Pictures are saved in the Realtime Database**, as compressed images, not in Firebase Storage. Firebase Storage now requires the paid Blaze plan, which needs a card, so this keeps DRAPE free. The trade-off is the 1 GB limit above.
- **Free AI depends on a public demo you don't control.** Its owners could pause or close it. If that happens, find another copy of IDM-VTON on Hugging Face (search Spaces for "IDM-VTON") and put its name, like `someone/IDM-VTON`, in `js/config.js` on the `tryOnSpace` line. Overlay keeps working regardless.
- **IDM-VTON is for non-commercial use** under its licence. Fine for personal use; don't sell try-ons made with it.
- **Extract Clothes can't invent hidden parts.** If an arm or bag covers part of a shirt, the picture will have gaps (DRAPE warns you). A jacket over a shirt comes out as one item.
- **The first background removal and the first extraction each download a free AI model** (roughly 30–40 MB). Your browser keeps it, so later uses are quick.
- **The background remover** is the open-source `@imgly/background-removal` library (AGPL licence). That's fine for personal use.
- **The AI Stylist uses built-in styling rules** (colour harmony, occasion, weather). It runs on your device and only suggests clothes you own.
- **Demo mode** keeps everything in memory only.

## Something's wrong?

| What you see | What to do |
|---|---|
| GitHub shows **404** | Make sure `index.html` is at the top of the repository, not inside a folder. Check **Settings › Pages** uses **Deploy from a branch** › **main** › **/ (root)**. Wait 2 minutes. |
| **DRAPE didn't start** | Usually a typo in `js/config.js`. Every value needs quote marks and each line ends with a comma. Compare with the example in Step 2a. Then press Ctrl+Shift+R (Cmd+Shift+R on Mac). |
| Still seeing the old DRAPE | Reload once more. If it persists: browser settings › clear site data for `github.io`. |
| "Firebase isn't connected yet" | `apiKey` or `appId` in `config.js` still say `PASTE_…`. |
| "This website address is not allowed yet" | Add `yourname.github.io` to Firebase › Authentication › Settings › **Authorized domains**. |
| "This sign-in method is switched off" | Turn on Email/Password or Google in Firebase › Authentication › **Sign-in method**. |
| "Saving was blocked by the database rules" | Paste `firebase-rules.json` into Firebase › Realtime Database › **Rules** and **Publish**. |
| "Today's free AI time on Hugging Face is used up" | Try tomorrow, add a free Hugging Face token in Settings, or use Overlay. |
| "The free AI is not available right now" or "is waking up" | Wait a few minutes and try again. If it lasts for days, see "Free AI depends on a public demo" above. |
| Free AI result looks wrong | Use a clear, front-facing, full-body photo with arms by your sides, and a top photographed flat. |
| Google sign-in window doesn't open | Allow pop-ups for your DRAPE site. |
| Opened `index.html` by double-clicking | The demo works, but sign-in needs your github.io address. |

If something else goes wrong, note the exact message DRAPE shows. It's written to tell you which setting to check.
