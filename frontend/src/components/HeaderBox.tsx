import { Box, Typography, useTheme } from "@mui/material";

interface HeaderBoxProps {
  type?: "title" | "greeting";
  title?: string;
  subtext?: string;
  user?: string;
}

const HeaderBox = ({
  type = "title",
  title,
  subtext,
  user,
}: HeaderBoxProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          display: 'inline-block',
          position: 'relative',
          pb: 1,
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '170px',
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '2px',
          },
        }}
      >
        {title}
        {type === "greeting" && user && (
          <Typography
           variant="h4"
            component="span"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
              ml: 1,
            }}
          >
            {user}
          </Typography>
        )}
      </Typography>

      {subtext && (
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mt: 1,
          }}
        >
          {subtext}
        </Typography>
      )}
    </Box>
  );
};

export default HeaderBox;