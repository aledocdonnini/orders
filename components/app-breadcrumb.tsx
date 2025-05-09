"use client";

import * as React from "react";

import { useParams } from "next/navigation";
import { useEvent } from "@/hooks/useEvent";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumb({
  ...props
}: React.ComponentProps<typeof Breadcrumb>) {
  const { id } = useParams();
  const eventId = Number(id);
  const { event } = useEvent(eventId);
  const eventTitle = eventId ? event?.title : "Eventi";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Eventi</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{eventTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
