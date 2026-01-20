import { Metadata } from "next";
import { appConfig } from "@/lib/config";
import { JsonLd, createWebPageJsonLd } from "@/components/json-ld";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: `Contact Us | ${appConfig.projectName}`,
  description: "Get in touch with us. We'd love to hear from you.",
  openGraph: {
    title: `Contact Us | ${appConfig.projectName}`,
    description: "Get in touch with us. We'd love to hear from you.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
  },
};

export default function ContactPage() {
  const jsonLd = {
    ...createWebPageJsonLd({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
      title: "Contact Us",
      description: "Get in touch with us. We'd love to hear from you.",
      publisherName: appConfig.projectName,
      publisherUrl: process.env.NEXT_PUBLIC_APP_URL,
    }),
    publisher: {
      "@type": "Organization",
      name: appConfig.projectName,
      url: process.env.NEXT_PUBLIC_APP_URL,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: appConfig.legal.phone,
        email: appConfig.legal.email,
        contactType: "customer service",
      },
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContactForm />
    </>
  );
}
