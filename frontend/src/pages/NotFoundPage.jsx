import React from 'react';
import { Result, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Paragraph } = Typography;

function NotFoundPage() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    >
    </Result>
  );
}

export default NotFoundPage;