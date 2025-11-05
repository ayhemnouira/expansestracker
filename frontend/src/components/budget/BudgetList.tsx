// BudgetList.tsx
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Button, Grid, Chip, CircularProgress, Snackbar, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { deleteBudget, getBudgets, type Budget } from '../../api/BudgetService';


const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getBudgets(true).then(data => {
      setBudgets(data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load budgets');
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteBudget(id);
      setBudgets(budgets.filter(b => b.id !== id));
    } catch {
      setError('Failed to delete budget');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box sx={{ p: 4, background: theme => theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>Your Budgets</Typography>
      <Grid container spacing={4}>
        {budgets.map(b => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card elevation={6} sx={{ borderRadius: 4, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{b.category}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Amount: ${b.amount.toFixed(2)}</Typography>
                <Typography color="text.secondary">Spent: ${b.spent.toFixed(2)}</Typography>
                <Typography color="text.secondary">Remaining: ${b.remaining.toFixed(2)}</Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={b.percentageUsed} color={b.status === 'EXCEEDED' ? 'error' : b.status === 'WARNING' ? 'warning' : 'success'} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>{b.percentageUsed.toFixed(2)}% Used</Typography>
                </Box>
                <Chip label={b.status} color={b.status === 'EXCEEDED' ? 'error' : b.status === 'WARNING' ? 'warning' : 'success'} size="small" sx={{ mt: 2, fontWeight: 'bold' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Days Left: {b.daysRemaining}</Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <IconButton color="primary" onClick={() => navigate(`/budgets/${b.id}/edit`)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(b.id)}><DeleteIcon /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" color="primary" onClick={() => navigate('/budgets/create')} sx={{ mt: 6, px: 6, py: 1.5, borderRadius: 2, boxShadow: 4 }}>Create New Budget</Button>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};
export default BudgetList;