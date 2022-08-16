import PageContainer from '../components/PageContainer';
import DocumentEditor from '../components/DocumentEditor';

export default function Home() {
  return (
    <PageContainer title="Створення документу" subtitle="Оберіть шаблон для початку роботи">
      <DocumentEditor />
    </PageContainer>
  )
};

