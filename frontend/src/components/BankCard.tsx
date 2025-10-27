import {
  Box,
  Card,
  CardContent,
  Typography,
  Link as MuiLink,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import paypassUrl from "../assets/Paypass.svg?url";
import mastercardUrl from "../assets/mastercard.svg?url";
import linesUrl from "../assets/lines.png?url";
import { tokens } from "../theme/theme";
import { formatAmountUsd } from "../utils/utils";
import type { CreditCardProps } from "../types";

const BankCard = ({
  account,
  userName,
  showBalance = true,
}: CreditCardProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 🎨 Brighter left gradient
  const leftBrightStart = "#A1E3F9"; // very light aqua blue
  const leftBrightEnd = "#4FC1DB"; // seaSerpent

  // 🎨 Darker right gradient
  const rightDarkStart = "#3B556E"; // policeBlue
  const rightDarkEnd = "#243545"; // deeper navy

  const handleCopy = async () => {
    if (!account?.shareableId) return;
    try {
      await navigator.clipboard.writeText(account.shareableId);
    } catch {
      // no-op
    }
  };

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <MuiLink
        href={`/transaction-history/?id=${account.appwriteItemId}`}
        underline="none"
        sx={{ display: "inline-flex", width: "100%", maxWidth: 320 }}
      >
        <Card
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 320,
            height: 190,
            borderRadius: "20px",
            border: `1px solid #ffffff`,
            boxShadow: theme.shadows[6],
            overflow: "hidden",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Left content panel */}
          <CardContent
            sx={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              maxWidth: 300,
              borderTopLeftRadius: "20px",
              borderBottomLeftRadius: "20px",
              backgroundImage: `linear-gradient(160deg, ${leftBrightStart} 0%, ${leftBrightEnd} 100%)`,
              px: 2.5,
              pt: 2.5,
              pb: 2,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: "#ffffff", fontSize: 16 }}
              >
                {account.name}
              </Typography>
              <Typography
                variant="body1"
                fontWeight={900}
                sx={{
                  color: "#ffffff",
                  fontSize: 20,
                  fontFamily: "IBM Plex Serif, serif",
                }}
              >
                {formatAmountUsd(account.currentBalance)}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color: "#ffffff", fontSize: 12 }}
                >
                  {userName}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color: "#ffffff", fontSize: 12 }}
                >
                  ●● / ●●
                </Typography>
              </Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                letterSpacing={1.1}
                sx={{ color: "#ffffff", fontSize: 14 }}
              >
                ●●●● ●●●● ●●●●{" "}
                <Box component="span" sx={{ fontSize: 16 }}>
                  {account.mask}
                </Box>
              </Typography>
            </Box>
          </CardContent>

          {/* Right icon panel */}
          <Box
            sx={{
              position: "relative",
              zIndex: 10,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "space-between",
              borderTopRightRadius: "20px",
              borderBottomRightRadius: "20px",
              backgroundImage: `linear-gradient(135deg, ${rightDarkStart} 0%, ${rightDarkEnd} 100%)`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              pr: 2.5,
              py: 2.5,
            }}
          >
            <Box
              component="img"
              src={paypassUrl}
              alt="pay"
              sx={{ width: 20, height: 24 }}
            />
            {/* Middle lines image inside right panel */}
            <Box
              sx={{
                flexGrow: 1,
                alignSelf: "stretch",
                backgroundImage: `url(${linesUrl})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
              }}
            />
            <Box
              component="img"
              src={mastercardUrl}
              alt="mastercard"
              sx={{ width: 45, height: 32, ml: 2 }}
            />
          </Box>
        </Card>
      </MuiLink>

      {showBalance && account?.shareableId && (
        <Box mt={1} display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color={colors.grey[300]}>
            ID:
          </Typography>
          <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
            {account.shareableId}
          </Typography>
          <Tooltip title="Copy">
            <IconButton
              size="small"
              onClick={handleCopy}
              aria-label="copy shareable id"
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
export default BankCard;
