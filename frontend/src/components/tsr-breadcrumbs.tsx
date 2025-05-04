import {Fragment} from "react";
import {Link, isMatch, useMatches} from "@tanstack/react-router";
import type {LinkProps} from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbsData {
  breadcrumbs: Array<LinkProps & {label: string}>;
}

export function TsrBreadcrumbs() {
  const matches = useMatches();

  const breadcrumbs = matches
    .filter((match) => isMatch(match, "loaderData.breadcrumbs"))
    .flatMap((match) => match.loaderData?.breadcrumbs!);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map(({label, ...linkProps}, index, arr) => {
          const isTail = index === arr.length - 1;

          if (isTail) {
            return (
              <BreadcrumbItem key={label}>
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          return (
            <Fragment key={linkProps.to}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link {...linkProps}>{label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
