"use-client";
import { useEffect, useState } from "react";
import { PageHeaderCentered } from "../components/PageHeaderCentered";
import { InfoCardGrid } from "../components/InfoCardGrid";
import type { FormEvent } from "react";

type Resource = {
  id: number;
  title: string;
  url: string;
  description: string;
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const newResource = { title, url, description };
      const res = await fetch("http://localhost:3000/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newResource),
      });
      if (!res.ok) throw new Error("Failed to add resource");
      const data = await res.json();
      setResources((prev) => [...(prev || []), data]); // Update list
      setTitle("");
      setUrl("");
      setDescription("");
    } catch (err) {
      console.error("Failed to add resource:", err);
    }
  };

  useEffect(() => {
    fetch("http://localhost:3000/resources")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch resources");
        return res.json();
      })
      .then((data) => setResources(data))
      .catch((err) => console.error("Error fetching resources:", err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeaderCentered
        title="Resources"
        description="Here are just a few ways you can grow in your personal relationship with God"
        showBackButton
        backButtonText="Back to Contact Form"
        backButtonHref="/"
      />

      <InfoCardGrid title="All Resources" items={resources} />
    </div>
  );
}
