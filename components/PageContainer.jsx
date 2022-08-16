import Head from "next/head";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { askLogin, getToken, QUEUE_API, fetch, setToken } from "../util/api";
import useSWR from "swr";

const PageContainer = ({ pageTitle, title, subtitle, children }) => {
  const { data, error } = useSWR(`${QUEUE_API}/auth`, fetch, { errorRetryInterval: 1000, errorRetryCount: Number.MAX_SAFE_INTEGER });
  const pageSubtitle = subtitle ?? title;

  useEffect(() => { askLogin(); }, [error]);

  return (
    data
      ? (
        <div className="page-container">
          <Head>
            <title>{pageTitle ?? title}</title>
            <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1"></meta>
          </Head>
          <Navbar auth={data} logout={() => { setToken(null); askLogin(true); }} />
          <div className="main-content container">
            <header style={{ marginBottom: subtitle ? '3em' : '1em'  }}>
              {
                subtitle &&
                <h1 className="title">{title}</h1>
              }
              <p className="subtitle is-4">{pageSubtitle}</p>
            </header>
            {children}
          </div>
        </div>
      )
      : null
  );
};

export default PageContainer;