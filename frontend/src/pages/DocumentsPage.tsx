import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogContent,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  TextField,
  Stack,
  MenuItem,
  Menu,
  Divider,
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  Download,
  Search,
  MoreVert,
  Receipt,
  Description,
  AccountBalance as BankIcon,
  Article,
  AttachMoney,
  FolderOpen,
  Image as ImageIcon,
  PictureAsPdf,
  Close,
  Link as LinkIcon,
  CheckCircle,
  Storage,
} from "@mui/icons-material";

import {
  getUserDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  type Document,
} from "../api/documentService";
import { handleError } from "../utils/errorHandler";
import { tokens } from "../theme/theme";

const documentTypes = [
  {
    value: "RECEIPT",
    label: "Receipt",
    icon: Receipt,
    color: "#10b981",
    emoji: "🧾",
  },
  {
    value: "INVOICE",
    label: "Invoice",
    icon: Description,
    color: "#f59e0b",
    emoji: "📄",
  },
  {
    value: "BANK_STATEMENT",
    label: "Bank Statement",
    icon: BankIcon,
    color: "#6366f1",
    emoji: "🏦",
  },
  {
    value: "CONTRACT",
    label: "Contract",
    icon: Article,
    color: "#8b5cf6",
    emoji: "📋",
  },
  {
    value: "PROOF_OF_PAYMENT",
    label: "Proof of Payment",
    icon: AttachMoney,
    color: "#14b8a6",
    emoji: "💳",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: FolderOpen,
    color: "#64748b",
    emoji: "📁",
  },
];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || "Operation failed";
  }
  return "An unexpected error occurred";
};

const DocumentsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const [formData, setFormData] = useState({
    documentType: "RECEIPT",
    description: "",
    transactionId: undefined as number | undefined,
  });

  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const formattedTotalSize = (totalSize / (1024 * 1024)).toFixed(2);
  const linkedCount = documents.filter((d) => d.transactionId).length;

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const filtered = documents.filter(
      (doc) =>
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  const fetchDocuments = async () => {
    try {
      const data = await getUserDocuments();
      setDocuments(data);
      setFilteredDocuments(data);
    } catch (error) {
      const errorMessage = handleError(error, "Failed to fetch documents");
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "File size must be less than 5MB",
        severity: "error",
      });
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: "Only PDF, JPG, and PNG files are allowed",
        severity: "error",
      });
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await uploadDocument({
        file: selectedFile,
        documentType: formData.documentType,
        description: formData.description || undefined,
        transactionId: formData.transactionId,
      });

      setSnackbar({
        open: true,
        message: "Document uploaded successfully!",
        severity: "success",
      });
      await fetchDocuments();
      handleCloseUploadDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error),
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await deleteDocument(docId);
      setSnackbar({
        open: true,
        message: "Document deleted successfully!",
        severity: "success",
      });
      await fetchDocuments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error),
        severity: "error",
      });
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc.id, doc.fileName);
      setSnackbar({
        open: true,
        message: `Downloading ${doc.fileName}...`,
        severity: "info",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error),
        severity: "error",
      });
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialog(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({
      documentType: "RECEIPT",
      description: "",
      transactionId: undefined,
    });
  };
  const getTypeInfo = (type: string) => {
    return (
      documentTypes.find((t) => t.value === type) ||
      documentTypes[documentTypes.length - 1]
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: 3,
          bgcolor: isDark ? "#060918" : "#ffffff",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={70} thickness={3} sx={{ color: "#6366f1" }} />
          <Box
            sx={{
              position: "absolute",
              width: 50,
              height: 50,
              borderRadius: "50%",
              bgcolor: alpha("#6366f1", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InsertDriveFile sx={{ fontSize: 24, color: "#6366f1" }} />
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}
        >
          Loading documents...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "#060918" : "#ffffff",
        position: "relative",
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          position: "relative",
        }}
      >
        {/* Modern Header */}
        <Fade in timeout={600}>
          <Box mb={5}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)"
                        : "linear-gradient(135deg, #1e293b 0%, #6366f1 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Documents
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? "#64748b" : "#64748b",
                    fontWeight: 500,
                    fontSize: "1.05rem",
                  }}
                >
                  Manage your receipts, invoices, and financial documents
                </Typography>
              </Box>
              <Chip
                icon={<InsertDriveFile sx={{ fontSize: 20 }} />}
                label={`${filteredDocuments.length} Files`}
                sx={{
                  background: isDark
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(99, 102, 241, 0.1)",
                  color: isDark ? colors.primary[300] : colors.primary[700],
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  px: 1,
                  py: 2.5,
                  borderRadius: "12px",
                  border: `1px solid ${
                    isDark
                      ? "rgba(99, 102, 241, 0.2)"
                      : "rgba(99, 102, 241, 0.15)"
                  }`,
                }}
              />
            </Stack>
          </Box>
        </Fade>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Grow in timeout={800}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  borderRadius: "20px",
                  p: 3,
                  position: "relative",
                  overflow: "hidden",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(99, 102, 241, 0.4)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "200px",
                    height: "200px",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                  },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontSize: "0.75rem",
                          mb: 1,
                        }}
                      >
                        Total Documents
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: { xs: "1.75rem", md: "2.25rem" },
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {totalDocuments}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
                      >
                        files
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <InsertDriveFile sx={{ fontSize: 28, color: "white" }} />
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Grow>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Grow in timeout={1000}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "20px",
                  p: 3,
                  position: "relative",
                  overflow: "hidden",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(245, 158, 11, 0.4)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "200px",
                    height: "200px",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                  },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontSize: "0.75rem",
                          mb: 1,
                        }}
                      >
                        Storage Used
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: { xs: "1.75rem", md: "2.25rem" },
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {formattedTotalSize}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
                      >
                        MB
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Storage sx={{ fontSize: 28, color: "white" }} />
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Grow>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Grow in timeout={1200}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: "20px",
                  p: 3,
                  position: "relative",
                  overflow: "hidden",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(16, 185, 129, 0.4)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "200px",
                    height: "200px",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                  },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontSize: "0.75rem",
                          mb: 1,
                        }}
                      >
                        Linked Docs
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: { xs: "1.75rem", md: "2.25rem" },
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {linkedCount}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
                      >
                        to transactions
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LinkIcon sx={{ fontSize: 28, color: "white" }} />
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Modern Search & Upload */}
        <Fade in timeout={1400}>
          <Card
            sx={{
              borderRadius: "20px",
              mb: 4,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(0,0,0,0.08)",
              bgcolor: isDark ? alpha("#1e293b", 0.6) : "#fff",
              backdropFilter: "blur(20px)",
              border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.4)"
                  : "0 8px 32px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search documents by name, type, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#6366f1", fontSize: 24 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      bgcolor: isDark ? alpha("#0f172a", 0.5) : "#f8fafc",
                      transition: "all 0.3s ease",
                      "& fieldset": {
                        borderColor: isDark
                          ? alpha("#fff", 0.08)
                          : alpha("#6366f1", 0.2),
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#6366f1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1",
                        borderWidth: "2px",
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialog(true)}
                  sx={{
                    minWidth: { xs: "100%", sm: 220 },
                    py: 2,
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      boxShadow: "0 12px 32px rgba(99, 102, 241, 0.5)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Upload Document
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Documents Grid - Enhanced */}
        <Fade in timeout={1600}>
          <Box>
            {filteredDocuments.length === 0 ? (
              <Card
                sx={{
                  borderRadius: "24px",
                  border: `2px dashed ${
                    isDark ? colors.grey[700] : colors.grey[300]
                  }`,
                  background: isDark
                    ? "rgba(17, 24, 39, 0.4)"
                    : "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(10px)",
                  p: 8,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    boxShadow: "0 12px 40px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <FolderOpen sx={{ fontSize: 48, color: "white" }} />
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{
                    color: isDark ? colors.grey[100] : colors.grey[900],
                    mb: 1.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  No documents found
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? colors.grey[400] : colors.grey[600],
                    mb: 4,
                    maxWidth: 480,
                    mx: "auto",
                    lineHeight: 1.7,
                  }}
                >
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "Upload your first document to start organizing your financial records"}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialog(true)}
                  sx={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: "14px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 32px rgba(99, 102, 241, 0.45)",
                    },
                  }}
                >
                  Upload Your First Document
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {filteredDocuments.map((doc, index) => {
                  const typeInfo = getTypeInfo(doc.documentType);

                  return (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doc.id}>
                      <Grow in timeout={1600 + index * 100}>
                        <Card
                          sx={{
                            borderRadius: "20px",
                            boxShadow: isDark
                              ? "0 4px 24px rgba(0,0,0,0.3)"
                              : "0 4px 24px rgba(0,0,0,0.08)",
                            bgcolor: isDark ? alpha("#1e293b", 0.6) : "#fff",
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
                            transition: "all 0.3s ease",
                            overflow: "hidden",
                            "&:hover": {
                              transform: "translateY(-6px)",
                              boxShadow: isDark
                                ? "0 16px 48px rgba(0,0,0,0.4)"
                                : "0 16px 48px rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 0 }}>
                            {/* File Preview Area */}
                            <Box
                              sx={{
                                height: 160,
                                background: `linear-gradient(135deg, ${alpha(typeInfo.color, 0.15)} 0%, ${alpha(typeInfo.color, 0.05)} 100%)`,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                borderBottom: `2px solid ${alpha(typeInfo.color, 0.2)}`,
                              }}
                            >
                              <Typography sx={{ fontSize: "3.5rem", mb: 1 }}>
                                {typeInfo.emoji}
                              </Typography>
                              <Chip
                                label={typeInfo.label}
                                size="small"
                                sx={{
                                  bgcolor: alpha(typeInfo.color, 0.2),
                                  color: typeInfo.color,
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: "24px",
                                  borderRadius: "8px",
                                  border: `1px solid ${alpha(typeInfo.color, 0.3)}`,
                                }}
                              />
                            </Box>

                            {/* File Info */}
                            <Box sx={{ p: 3 }}>
                              <Box
                                display="flex"
                                alignItems="start"
                                justifyContent="space-between"
                                mb={2}
                              >
                                <Box flex={1} minWidth={0} mr={1}>
                                  <Typography
                                    variant="h6"
                                    fontWeight="800"
                                    sx={{
                                      color: isDark ? "#fff" : "#0f172a",
                                      mb: 0.5,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontSize: "1rem",
                                    }}
                                  >
                                    {doc.fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: isDark ? "#64748b" : "#94a3b8",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {doc.fileSizeFormatted}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setSelectedDoc(doc);
                                  }}
                                  sx={{
                                    bgcolor: isDark
                                      ? alpha("#fff", 0.05)
                                      : alpha("#6366f1", 0.1),
                                    borderRadius: "10px",
                                    width: 36,
                                    height: 36,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: isDark
                                        ? alpha("#fff", 0.1)
                                        : alpha("#6366f1", 0.15),
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                >
                                  <MoreVert
                                    fontSize="small"
                                    sx={{ color: "#6366f1" }}
                                  />
                                </IconButton>
                              </Box>

                              {/* Description */}
                              {doc.description && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDark ? "#94a3b8" : "#64748b",
                                    mb: 2.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    lineHeight: 1.6,
                                    minHeight: "3.2em",
                                  }}
                                >
                                  {doc.description}
                                </Typography>
                              )}

                              {/* Transaction Link */}
                              {doc.transactionName && (
                                <Box
                                  sx={{
                                    bgcolor: isDark
                                      ? alpha("#10b981", 0.1)
                                      : alpha("#10b981", 0.08),
                                    border: `1px solid ${alpha("#10b981", 0.25)}`,
                                    borderRadius: "12px",
                                    p: 1.5,
                                    mb: 2.5,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <CheckCircle
                                    sx={{ fontSize: 18, color: "#10b981" }}
                                  />
                                  <Box flex={1} minWidth={0}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#10b981",
                                        fontWeight: 700,
                                        fontSize: "0.7rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        display: "block",
                                        mb: 0.25,
                                      }}
                                    >
                                      Linked to
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isDark ? "#fff" : "#0f172a",
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {doc.transactionName}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}

                              {/* Upload Date */}
                              <Divider
                                sx={{
                                  my: 2,
                                  borderColor: isDark
                                    ? alpha("#fff", 0.05)
                                    : "#f1f5f9",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: isDark ? "#64748b" : "#94a3b8",
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                📅 Uploaded{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Fade>

        {/* Enhanced Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              bgcolor: isDark ? "#1e293b" : "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: `1px solid ${isDark ? alpha("#fff", 0.05) : "#e2e8f0"}`,
              minWidth: 180,
              mt: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              if (selectedDoc) handleDownload(selectedDoc);
              setAnchorEl(null);
            }}
            sx={{
              py: 1.5,
              px: 2.5,
              borderRadius: "12px",
              mx: 1,
              my: 0.5,
              fontWeight: 600,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha("#6366f1", 0.1),
                color: "#6366f1",
              },
            }}
          >
            <Download sx={{ mr: 1.5, fontSize: 20 }} /> Download
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedDoc) handleDelete(selectedDoc.id);
              setAnchorEl(null);
            }}
            sx={{
              py: 1.5,
              px: 2.5,
              borderRadius: "12px",
              mx: 1,
              my: 0.5,
              color: "#ef4444",
              fontWeight: 600,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha("#ef4444", 0.1),
              },
            }}
          >
            <Delete sx={{ mr: 1.5, fontSize: 20 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Enhanced Upload Dialog */}
        <Dialog
          open={uploadDialog}
          onClose={handleCloseUploadDialog}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Slide}
          TransitionProps={{ direction: "up" } as any}
          PaperProps={{
            sx: {
              borderRadius: "28px",
              bgcolor: isDark ? "#0f172a" : "#fff",
              backgroundImage: "none",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            },
          }}
        >
          {/* Dialog Header with Gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              p: 4,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ position: "relative" }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "white",
                    mb: 0.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Upload Document
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
                >
                  Add a new document to your records
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseUploadDialog}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                <Close />
              </IconButton>
            </Stack>
          </Box>

          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3.5}>
              {/* File Upload Area */}
              <Box>
                <input
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  style={{ display: "none" }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Box
                    sx={{
                      border: `2px dashed ${alpha("#6366f1", 0.4)}`,
                      borderRadius: "20px",
                      p: 4,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: isDark
                        ? alpha("#6366f1", 0.05)
                        : alpha("#6366f1", 0.02),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#6366f1",
                        bgcolor: isDark
                          ? alpha("#6366f1", 0.1)
                          : alpha("#6366f1", 0.05),
                        transform: "scale(1.01)",
                      },
                    }}
                  >
                    {selectedFile ? (
                      <Box>
                        {previewUrl ? (
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Preview"
                              style={{
                                maxWidth: "100%",
                                maxHeight: 200,
                                borderRadius: 16,
                                marginBottom: 16,
                                boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 90,
                              height: 90,
                              borderRadius: "18px",
                              background:
                                "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 2,
                              boxShadow: "0 8px 24px rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            <PictureAsPdf
                              sx={{ fontSize: 44, color: "white" }}
                            />
                          </Box>
                        )}
                        <Typography
                          variant="h6"
                          fontWeight="800"
                          sx={{
                            color: isDark ? "#fff" : "#0f172a",
                            mb: 0.5,
                          }}
                        >
                          {selectedFile.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDark ? "#64748b" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "18px",
                            background:
                              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2.5,
                            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                          }}
                        >
                          <CloudUpload sx={{ fontSize: 36, color: "white" }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="800"
                          sx={{ color: isDark ? "#fff" : "#0f172a", mb: 1 }}
                        >
                          Click to upload or drag and drop
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDark ? "#64748b" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          PDF, JPG, PNG (Max 5MB)
                        </Typography>
                      </>
                    )}
                  </Box>
                </label>
              </Box>

              {/* Document Type */}
              <TextField
                select
                label="Document Type"
                fullWidth
                value={formData.documentType}
                onChange={(e) =>
                  setFormData({ ...formData, documentType: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                    "& fieldset": {
                      borderColor: isDark ? alpha("#fff", 0.08) : "#e2e8f0",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6366f1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366f1",
                      borderWidth: "2px",
                    },
                  },
                }}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography fontSize="1.25rem">{type.emoji}</Typography>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: type.color,
                        }}
                      />
                      <Typography fontWeight="600">{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Description */}
              <TextField
                label="Description (Optional)"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add notes about this document..."
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                    "& fieldset": {
                      borderColor: isDark ? alpha("#fff", 0.08) : "#e2e8f0",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6366f1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366f1",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            </Stack>
          </DialogContent>

          {/* Dialog Footer */}
          <Box
            sx={{
              p: 4,
              pt: 2,
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCloseUploadDialog}
              sx={{
                py: 2,
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                borderColor: isDark ? alpha("#fff", 0.1) : "#e2e8f0",
                borderWidth: "2px",
                color: isDark ? "#94a3b8" : "#64748b",
                "&:hover": {
                  borderWidth: "2px",
                  borderColor: isDark ? alpha("#fff", 0.2) : "#cbd5e1",
                  bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              sx={{
                py: 2,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "1rem",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 12px 32px rgba(99, 102, 241, 0.5)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: isDark ? alpha("#fff", 0.05) : "#e2e8f0",
                  color: isDark ? "#475569" : "#94a3b8",
                  boxShadow: "none",
                },
              }}
            >
              {uploading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Upload Document"
              )}
            </Button>
          </Box>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              borderRadius: "14px",
              fontWeight: 700,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              ...(snackbar.severity === "success" && {
                bgcolor: "#10b981",
                color: "#fff",
                "& .MuiAlert-icon": { color: "#fff" },
              }),
              ...(snackbar.severity === "error" && {
                bgcolor: "#ef4444",
                color: "#fff",
                "& .MuiAlert-icon": { color: "#fff" },
              }),
              ...(snackbar.severity === "info" && {
                bgcolor: "#6366f1",
                color: "#fff",
                "& .MuiAlert-icon": { color: "#fff" },
              }),
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default DocumentsPage;
