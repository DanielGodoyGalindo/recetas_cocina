import * as React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

type RecipePaginationProps = {
  total: number;
  perPage: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function RecipePagination({
  total,
  perPage,
  page,
  onChange,
}: RecipePaginationProps) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <Stack spacing={2} alignItems="center" mt={3}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        color="primary"
      />
    </Stack>
  );
}
