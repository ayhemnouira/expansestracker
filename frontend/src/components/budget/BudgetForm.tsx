// BudgetForm.tsx - Fixed
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createBudget, getBudgetById, updateBudget, type Budget } from '../../api/BudgetService';

const BudgetForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Budget>>({
    category: '',
    amount: 0,
    period: 'MONTHLY',
    startDate: '',
    endDate: '',
    alertThreshold: 80,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getBudgetById(Number(id))
        .then((data) => {
          setFormData(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load budget');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> |
      React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (id) await updateBudget(Number(id), formData);
      else await createBudget(formData);
      navigate('/budgets');
    } catch {
      setError('Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card elevation={6} sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {id ? 'Edit' : 'Create'} Budget
          </Typography>
          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <TextField
                  name="category"
                  label="Category"
                  value={formData.category}
                  onChange={handleChange}
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  name="amount"
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Period</InputLabel>
                <Select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  label="Period"
                >
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  name="alertThreshold"
                  label="Alert Threshold (%)"
                  type="number"
                  value={formData.alertThreshold}
                  onChange={handleChange}
                  variant="outlined"
                />
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={submit}
                fullWidth
                sx={{ mt: 3, py: 1.5, borderRadius: 2, boxShadow: 3 }}
                disabled={loading}
              >
                Save
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default BudgetForm;