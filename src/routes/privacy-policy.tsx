import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — Punqle" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="August 22, 2026">
      <p>
        This Privacy Policy explains what information Punqle ("Punqle," "we," "us") collects when you use the
        Punqle app at punqle.com, how we use it, and what choices you have. Punqle is operated by HOSSEN, MD
        MOSHARRAF (ABN 47 183 516 336), based in Australia.
      </p>
      <p>
        This policy describes what Punqle actually does today. If we add new features that change what data we
        collect or how we use it — for example, direct posting to Facebook or Instagram, which is not yet part of
        the app — we will update this policy before that feature becomes active.
      </p>

      <h2>1. Information We Collect</h2>
      <p><strong>Account information.</strong> When you sign up, we (via our authentication provider, Supabase) collect your email address and a securely hashed password to create and secure your account.</p>
      <p><strong>Business and content information you provide.</strong> To generate ads and content for you, we collect:</p>
      <ul>
        <li>Business details you enter, such as your business name, category, brand color, and logo</li>
        <li>Product or item descriptions you type in</li>
        <li>Product photos you upload for us to turn into ad images</li>
        <li>Any web page URL you paste in for our competitor-analysis or product-import tools (we fetch the public content of that page)</li>
      </ul>
      <p><strong>Content we generate for you.</strong> We store the ad copy, captions, and images our AI generates for you, so you can view and reuse your recent posts. We keep your 20 most recently generated posts; older ones are automatically deleted as new ones are created.</p>
      <p><strong>Payment and subscription information.</strong> If you subscribe to a paid plan, payment is handled entirely by our payment processor, Stripe, on Stripe's own hosted checkout page. We never see or store your card number. We store only a Stripe customer/subscription reference, your plan tier, and billing status, so we know what you're subscribed to.</p>
      <p><strong>Shopify integration (optional).</strong> If you choose to connect a Shopify store, we store your store's domain and an access token that lets us read your product catalog, so we can import your products into Punqle. This only happens if you actively connect your store, and you can disconnect it at any time from within the app.</p>
      <p><strong>Referral information.</strong> Punqle has an optional referral program. If you share your referral link, it contains your account ID. If someone signs up using it, we record that a referral occurred (linking the two account IDs) so we can grant referral credits. We do not share your email or other account details through this feature.</p>
      <p><strong>Credits.</strong> We keep a simple count of your remaining ad-generation credits.</p>

      <h2>2. How We Use Third-Party AI and Service Providers</h2>
      <p>To provide Punqle's features, we send certain information to the following third-party providers. We only send what each provider needs to do its specific job:</p>
      <ul>
        <li><strong>OpenAI</strong> — receives text you provide (such as product descriptions, business category, and post ideas) to generate ad copy and captions. We do not send images or your account details to OpenAI.</li>
        <li><strong>Google (Gemini API)</strong> — receives product photos you upload (if any) and text prompts, to generate or edit ad images and videos.</li>
        <li><strong>Pexels</strong> — receives only a search term, if you choose to search their stock photo library instead of uploading your own photo. No personal information is sent.</li>
        <li><strong>Stripe</strong> — handles billing and payment directly; see "Payment and subscription information" above.</li>
        <li><strong>Shopify</strong> — only if you connect your store; see "Shopify integration" above.</li>
        <li><strong>Supabase</strong> — our database and authentication provider, which securely hosts your account and the information described in this policy.</li>
      </ul>
      <p>We do not sell your information to anyone, and we do not share it with advertisers.</p>

      <h2>3. Cookies and Tracking</h2>
      <p>
        Punqle does not use cookies to keep you signed in — your session is stored in your browser's local storage
        instead. We do not currently run any analytics, advertising, or tracking tools (such as Google Analytics or
        Facebook Pixel) in the app. Our error-monitoring tooling is not currently active. If this changes, we will
        update this section.
      </p>

      <h2>4. Uploaded Images</h2>
      <p>
        Product photos you upload during ad or video generation are sent to our backend and to Google's Gemini API
        to create your ad image, and the result is stored with your generated post as described above. Photos you
        add only to build a downloadable carousel (in the carousel tool) are processed entirely in your own browser
        and are never uploaded to our servers.
      </p>

      <h2>5. How We Store and Protect Your Information</h2>
      <p>
        Your data is stored with Supabase, which provides database and authentication infrastructure with
        access controls restricting data to your own account. We restrict backend access to what's needed to
        operate the service. No method of storage or transmission is completely secure, but we take reasonable
        steps to protect your information.
      </p>

      <h2>6. Your Rights and Choices</h2>
      <p>You can review and update your business profile, disconnect your Shopify store, and delete individual generated posts at any time from within the app. For anything else — including deleting your account entirely — see our <a href="/data-deletion">Data Deletion</a> page.</p>

      <h2>7. Children's Privacy</h2>
      <p>Punqle is intended for business owners and is not directed at children. We do not knowingly collect information from anyone under 16.</p>

      <h2>8. Changes to This Policy</h2>
      <p>We may update this policy as Punqle's features change. We'll update the effective date above when we do. Significant changes — such as adding new data collection tied to a new feature — will be reflected here before that feature goes live.</p>

      <h2>9. Contact Us</h2>
      <p>Questions about this policy? Email <a href="mailto:hossenpalash@gmail.com">hossenpalash@gmail.com</a>.</p>
    </LegalLayout>
  );
}
