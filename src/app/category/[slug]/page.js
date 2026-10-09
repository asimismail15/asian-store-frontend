"use client";

import { useParams } from "next/navigation";
import CatalogPage from "@/components/CatalogPage";

export default function CategoryPage(){const {slug}=useParams();const category=decodeURIComponent(String(slug||""));return <CatalogPage category={category}/>}
