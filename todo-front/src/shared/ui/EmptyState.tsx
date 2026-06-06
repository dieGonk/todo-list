import { Icon } from './Icon';

type EmptyStateProps = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon name="inbox" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
