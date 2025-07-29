"use-client";
import { useEffect, useState } from "react";
import { PageHeaderCentered } from "../components/PageHeaderCentered";
import { InfoCardGrid } from "../components/InfoCardGrid";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

type Resource = {
  id: number;
  title: string;
  url: string;
  description: string;
};

export default function Resources() {
  const { t } = useTranslation();
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
      if (!res.ok) throw new Error(t("resources.errors.addFailed"));
      const data = await res.json();
      setResources((prev) => [...(prev || []), data]);
      setTitle("");
      setUrl("");
      setDescription("");
    } catch (err) {
      console.error(t("resources.errors.addFailed"), err);
    }
  };

  useEffect(() => {
    fetch("http://localhost:3000/resources")
      .then((res) => {
        if (!res.ok) throw new Error(t("resources.errors.fetchFailed"));
        return res.json();
      })
      .then((data) => setResources(data))
      .catch((err) => console.error(t("resources.errors.fetchFailed"), err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeaderCentered
        title={t("resources.title")}
        description={t("resources.description")}
        showBackButton
        backButtonText={t("resources.backButton")}
        backButtonHref="/"
      />

      <InfoCardGrid title={t("resources.allResources")} items={resources} />
    </div>
  );
}
