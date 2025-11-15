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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
} from "@mui/icons-material";

import {
  getUserDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  type Document,
} from "../api/documentService";
import { handleError } from "../utils/errorHandler";

const documentTypes = [
  { value: "RECEIPT", label: "Receipt", icon: Receipt, color: "#10b981" },
  { value: "INVOICE", label: "Invoice", icon: Description, color: "#f59e0b" },
  { value: "BANK_STATEMENT", label: "Bank Statement", icon: BankIcon, color: "#6366f1" },
  { value: "CONTRACT", label: "Contract", icon: Article, color: "#8b5cf6" },
  { value: "PROOF_OF_PAYMENT", label: "Proof of Payment", icon: AttachMoney, color: "#14b8a6" },
  { value: "OTHER", label: "Other", icon: FolderOpen, color: "#64748b" },
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

  // Statistics
  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const formattedTotalSize = (totalSize / (1024 * 1024)).toFixed(2);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const filtered = documents.filter(
      (doc) =>
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
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
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "File size must be less than 5MB",
        severity: "error",
      });
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: "Only PDF, JPG, and PNG files are allowed",
        severity: "error",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
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
    if (!window.confirm("Are you sure you want to delete this document?")) return;

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

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <PictureAsPdf sx={{ fontSize: 48, color: "#ef4444" }} />;
    }
    return <ImageIcon sx={{ fontSize: 48, color: "#3b82f6" }} />;
  };

  const getTypeInfo = (type: string) => {
    return documentTypes.find((t) => t.value === type) || documentTypes[documentTypes.length - 1];
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: isDark ? "#0a0e27" : "#f5f7fa",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "#0a0e27" : "#f5f7fa",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{ color: isDark ? "#fff" : "#1a1a2e", mb: 1 }}
        >
          Documents
        </Typography>
        <Typography variant="body1" sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}>
          Manage your receipts, invoices, and financial documents
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Documents
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {totalDocuments}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InsertDriveFile fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #5f1e3a 0%, #982a5c 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Storage Used
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {formattedTotalSize} MB
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloudUpload fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #1e5f3a 0%, #2a9862 100%)"
                : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Linked to Transactions
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {documents.filter((d) => d.transactionId).length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Receipt fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          bgcolor: isDark ? "#16213e" : "#fff",
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: isDark ? "#a0a0a0" : "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: isDark ? "#1a2332" : "#f8fafc",
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialog(true)}
              sx={{
                minWidth: 200,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              Upload Document
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            bgcolor: isDark ? "#16213e" : "#fff",
            p: 8,
            textAlign: "center",
          }}
        >
          <FolderOpen sx={{ fontSize: 64, color: isDark ? "#3a4a5c" : "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" color={isDark ? "#a0a0a0" : "#64748b"}>
            No documents found
          </Typography>
          <Typography variant="body2" color={isDark ? "#707070" : "#94a3b8"} mt={1}>
            {searchQuery ? "Try adjusting your search" : "Upload your first document"}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => {
            const typeInfo = getTypeInfo(doc.documentType);
            const TypeIcon = typeInfo.icon;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    bgcolor: isDark ? "#16213e" : "#fff",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent>
                    {/* File Preview */}
                    <Box
                      sx={{
                        height: 120,
                        borderRadius: 2,
                        bgcolor: isDark ? "#1a2332" : "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      {getFileIcon(doc.fileType)}
                    </Box>

                    {/* File Info */}
                    <Box display="flex" alignItems="start" justifyContent="space-between" mb={1}>
                      <Box flex={1}>
                        <Typography
                          variant="body1"
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
                        <Typography variant="caption" sx={{ color: isDark ? "#707070" : "#94a3b8" }}>
                          {doc.fileSizeFormatted}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedDoc(doc);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Type Badge */}
                    <Chip
                      icon={<TypeIcon sx={{ fontSize: 16 }} />}
                      label={typeInfo.label}
                      size="small"
                      sx={{
                        bgcolor: typeInfo.color + "20",
                        color: typeInfo.color,
                        fontWeight: 600,
                        mb: 1,
                      }}
                    />

                    {/* Description */}
                    {doc.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? "#a0a0a0" : "#64748b",
                          mb: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {doc.description}
                      </Typography>
                    )}

                    {/* Transaction Link */}
                    {doc.transactionName && (
                      <Box
                        sx={{
                          bgcolor: isDark ? "#1a2332" : "#f1f5f9",
                          borderRadius: 1,
                          p: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}>
                          Linked to: {doc.transactionName}
                        </Typography>
                      </Box>
                    )}

                    {/* Upload Date */}
                    <Typography variant="caption" sx={{ color: isDark ? "#707070" : "#94a3b8" }}>
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: isDark ? "#16213e" : "#fff",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedDoc) handleDownload(selectedDoc);
            setAnchorEl(null);
          }}
        >
          <Download sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedDoc) handleDelete(selectedDoc.id);
            setAnchorEl(null);
          }}
          sx={{ color: "#ef4444" }}
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: isDark ? "#16213e" : "#fff",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h5" fontWeight="700" sx={{ color: isDark ? "#fff" : "#1a1a2e" }}>
              Upload Document
            </Typography>
            <IconButton onClick={handleCloseUploadDialog}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <DialogContent sx={{ p: 0 }}>
            <Stack spacing={3}>
              {/* File Upload */}
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
                      border: `2px dashed ${isDark ? "#3a4a5c" : "#cbd5e1"}`,
                      borderRadius: 2,
                      p: 4,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: isDark ? "#1a2332" : "#f8fafc",
                      "&:hover": {
                        borderColor: "#667eea",
                        bgcolor: isDark ? "#1e2a3a" : "#f1f5f9",
                      },
                    }}
                  >
                    {selectedFile ? (
                      <Box>
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: 200,
                              borderRadius: 8,
                              marginBottom: 16,
                            }}
                          />
                        ) : (
                          <PictureAsPdf sx={{ fontSize: 64, color: "#ef4444", mb: 2 }} />
                        )}
                        <Typography variant="body1" fontWeight="600" sx={{ color: isDark ? "#fff" : "#1a1a2e" }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}>
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <CloudUpload sx={{ fontSize: 48, color: isDark ? "#3a4a5c" : "#cbd5e1", mb: 2 }} />
                        <Typography variant="body1" fontWeight="600" sx={{ color: isDark ? "#fff" : "#1a1a2e", mb: 1 }}>
                          Click to upload
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}>
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
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                InputLabelProps={{ shrink: true }}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <type.icon sx={{ fontSize: 20, color: type.color }} />
                      {type.label}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add notes about this document..."
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>

          <Box display="flex" gap={2} mt={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCloseUploadDialog}
              sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
            </Button>
          </Box>
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;