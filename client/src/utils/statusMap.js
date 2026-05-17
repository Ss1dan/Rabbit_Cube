export const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'cancelled':
        return 'Отменена';
      case 'pending':
        return 'Ожидает';
      case 'expired':
        return 'Истекла';
      default:
        return status;
    }
  };