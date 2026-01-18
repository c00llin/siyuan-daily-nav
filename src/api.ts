import { fetchSyncPost, openTab } from "siyuan";

// Re-export openTab from siyuan
export { openTab };

/**
 * Execute SQL query
 */
export async function sql(sqlQuery: string): Promise<any[]> {
    const response = await fetchSyncPost("/api/query/sql", {
        stmt: sqlQuery,
    });

    return response.data || [];
}

/**
 * Create a document with markdown content
 */
export async function createDocWithMd(
    notebook: string,
    path: string,
    markdown: string
): Promise<string> {
    const response = await fetchSyncPost("/api/filetree/createDocWithMd", {
        notebook,
        path,
        markdown,
    });

    return response.data;
}

/**
 * Get document by ID
 */
export async function getDoc(id: string): Promise<any> {
    const response = await fetchSyncPost("/api/block/getBlockInfo", {
        id,
    });

    return response.data;
}

/**
 * Get notebook configuration
 */
export async function getNotebookConf(notebook: string): Promise<any> {
    const response = await fetchSyncPost("/api/notebook/getNotebookConf", {
        notebook,
    });

    return response.data;
}

/**
 * Render a Sprig template
 */
export async function renderSprig(template: string): Promise<string> {
    const response = await fetchSyncPost("/api/template/renderSprig", {
        template,
    });

    return response.data;
}

/**
 * List all notebooks
 */
export async function lsNotebooks(): Promise<any> {
    const response = await fetchSyncPost("/api/notebook/lsNotebooks", {});

    return response.data;
}

/**
 * Set block attributes
 */
export async function setBlockAttrs(id: string, attrs: { [key: string]: string }): Promise<any> {
    const response = await fetchSyncPost("/api/attr/setBlockAttrs", {
        id,
        attrs,
    });

    return response.data;
}
