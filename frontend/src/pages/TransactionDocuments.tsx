import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Download,
  Delete,
  Receipt,
  PictureAsPdf,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  getTransactionDocuments,
  downloadDocument,
  deleteDocument,
  type Document,
} from "../api/documentService";

interface TransactionDocumentsProps {
  transactionId: number;
  onDocumentDeleted?: () => void;
}

const TransactionDocuments = ({
  transactionId,
  onDocumentDeleted,
}: TransactionDocumentsProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [transactionId]);

  const fetchDocuments = async () => {
    try {
      const data = await getTransactionDocuments(transactionId);
      setDocuments(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load documents";
      setError(errorMessage);
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await deleteDocument(docId);
      await fetchDocuments();
      onDocumentDeleted?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete document";
      setError(errorMessage);
      console.error("Error deleting document:", err);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc.id, doc.fileName);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to download document";
      setError(errorMessage);
      console.error("Error downloading document:", err);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <PictureAsPdf sx={{ fontSize: 40, color: "#ef4444" }} />;
    }
    return <ImageIcon sx={{ fontSize: 40, color: "#3b82f6" }} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Receipt
          sx={{ fontSize: 48, color: isDark ? "#3a4a5c" : "#cbd5e1", mb: 2 }}
        />
        <Typography variant="body2" color={isDark ? "#a0a0a0" : "#64748b"}>
          No documents attached to this transaction
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="600"
        mb={2}
        sx={{ color: isDark ? "#fff" : "#1a1a2e" }}
      >
        Attached Documents ({documents.length})
      </Typography>

      <Grid container spacing={2}>
        {documents.map((doc) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
            <Card
              sx={{
                borderRadius: 2,
                bgcolor: isDark ? "#1a2332" : "#f8fafc",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {getFileIcon(doc.fileType)}
                </Box>

                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{
                    color: isDark ? "#fff" : "#1a1a2e",
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {doc.fileName}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: isDark ? "#707070" : "#94a3b8" }}
                >
                  {doc.fileSizeFormatted}
                </Typography>

                <Chip
                  label={doc.documentType}
                  size="small"
                  sx={{
                    mt: 1,
                    mb: 1,
                    fontSize: "0.7rem",
                    height: 20,
                    bgcolor: isDark ? "#2a3441" : "#e2e8f0",
                    color: isDark ? "#a0a0a0" : "#64748b",
                  }}
                />

                <Box display="flex" gap={1} mt={2}>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(doc)}
                    sx={{
                      flex: 1,
                      bgcolor: isDark ? "#2a3441" : "#e2e8f0",
                      "&:hover": { bgcolor: isDark ? "#3a4a5c" : "#cbd5e1" },
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(doc.id)}
                    sx={{
                      flex: 1,
                      bgcolor: isDark ? "#2a3441" : "#fee2e2",
                      color: "#ef4444",
                      "&:hover": { bgcolor: isDark ? "#3a2a2a" : "#fecaca" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TransactionDocuments;
