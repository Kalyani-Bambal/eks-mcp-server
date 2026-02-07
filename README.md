# EKS MCP Server - Setup Guide

## Overview

The **EKS MCP Server** is a Model Context Protocol (MCP) server that provides programmatic access to Amazon EKS (Elastic Kubernetes Service) clusters. It allows you to interact with Kubernetes resources through the MCP interface, enabling integration with AI assistants and other applications.

### What is MCP?

The **Model Context Protocol (MCP)** is a standardized protocol that allows applications to provide context and tools to large language models. This server implements the MCP protocol to expose Kubernetes operations as callable tools.

---

## Prerequisites

Before setting up the EKS MCP server, ensure you have the following installed:

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **kubectl** (Kubernetes command-line tool)
   - Installation: https://kubernetes.io/docs/tasks/tools/install-kubectl/
   - Verify: `kubectl version --client`

4. **AWS CLI** (for EKS cluster access)
   - Installation: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
   - Verify: `aws --version`

### AWS Configuration

1. **AWS Credentials**
   - Configure AWS credentials: `aws configure`
   - Provide Access Key ID and Secret Access Key
   - Set default region: `ap-northeast-2` (or your cluster region)

2. **EKS Cluster Access**
   - Ensure you have permissions to access the EKS cluster
   - Update kubeconfig: 
     ```bash
     aws eks update-kubeconfig --region ap-northeast-2 --name Shared-cluster
     ```

3. **Verify kubectl Access**
   - List available contexts: `kubectl config get-contexts`
   - Verify cluster connection: `kubectl get nodes`

---

## Installation

### Step 1: Clone or Navigate to Repository

```bash
cd c:\Users\ashut\OneDrive\Desktop\Kalyani\Git\eks-mcp-server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `@kubernetes/client-node` - Kubernetes client library
- `@modelcontextprotocol/sdk` - MCP SDK for Node.js

### Step 3: Verify Installation

Verify that all dependencies are installed correctly:

```bash
npm list
```

You should see:
```
eks-mcp-server@1.0.0
├── @kubernetes/client-node@^1.4.0
└── @modelcontextprotocol/sdk@^1.26.0
```

---

## Configuration

### EKS Cluster Configuration

The server automatically loads your kubeconfig from the default location:
- Linux/macOS: `~/.kube/config`
- Windows: `%USERPROFILE%\.kube\config`

#### Configure Kubeconfig for EKS

1. **Add EKS cluster to kubeconfig:**
   ```bash
   aws eks update-kubeconfig --region ap-northeast-2 --name Shared-cluster --profile <your-aws-profile>
   ```

2. **Verify context:**
   ```bash
   kubectl config get-contexts
   ```

3. **Switch to EKS context (if needed):**
   ```bash
   kubectl config use-context eks-bastion
   ```

### MCP Server Configuration

The server is configured in `server.js` with the following defaults:
- **Server Name:** `eks-mcp-server`
- **Version:** `1.0.0`
- **Transport:** Stdio (standard input/output)
- **Capabilities:** Tools

#### Registering with MCP Clients

To use this server with an MCP client (e.g., Claude Desktop), configure it in your MCP client settings:

**For Claude Desktop** (`~/AppData/Roaming/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "eks-mcp-server": {
      "command": "node",
      "args": ["c:\\Users\\ashut\\OneDrive\\Desktop\\Kalyani\\Git\\eks-mcp-server\\server.js"],
      "env": {
        "KUBECONFIG": "C:\\Users\\ashut\\.kube\\config"
      }
    }
  }
}
```

---

## Available Tools

### 1. list_pods

Lists all pods across all namespaces in the cluster.

**Input:** None

**Output:** JSON array of pod names

**Example:**
```bash
kubectl --context="eks-bastion" get pods --all-namespaces
```

---

## Running the Server

### Start the Server

```bash
node server.js
```

You should see output indicating the server is running:
```
[Listening on stdio]
```

### Server will Wait for Commands

Once started, the server listens for MCP protocol commands from clients and executes them based on the requested tool.

### Stop the Server

Press `Ctrl+C` to stop the server.

---

## Demo & Usage Examples

### Demo 1: List All Pods in the Cluster

**Objective:** Get a list of all pods running in the Shared-cluster

#### Manual kubectl Command:
```bash
kubectl --context="eks-bastion" get pods --all-namespaces -o wide
```

#### Expected Output (Tabular Format):
```
NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE     IP              NODE
default       nginx-7c5d8bf9f7-7hkz5                   1/1     Running   0          2m      12.0.13.64      ip-12-0-13-242.ap-northeast-2.compute.internal
kube-system   aws-node-l5rdc                           2/2     Running   0          6h53m   12.0.13.242     ip-12-0-13-242.ap-northeast-2.compute.internal
kube-system   aws-node-msjfh                           2/2     Running   0          6h53m   12.0.11.88      ip-12-0-11-88.ap-northeast-2.compute.internal
kube-system   coredns-7dc8bfcfff-mgzh5                1/1     Running   0          6h54m   12.0.11.166     ip-12-0-11-88.ap-northeast-2.compute.internal
kube-system   coredns-7dc8bfcfff-zw69f                1/1     Running   0          6h54m   12.0.11.207     ip-12-0-11-88.ap-northeast-2.compute.internal
kube-system   kube-proxy-hfvxb                         1/1     Running   0          6h53m   12.0.13.242     ip-12-0-13-242.ap-northeast-2.compute.internal
kube-system   kube-proxy-qqzwq                         1/1     Running   0          6h53m   12.0.11.88      ip-12-0-11-88.ap-northeast-2.compute.internal
```

### Demo 2: List Cluster Nodes

**Objective:** View all nodes in the Shared-cluster

#### Command:
```bash
kubectl --context="eks-bastion" get nodes -o wide
```

#### Expected Output:
```
NAME                                             STATUS   ROLES    AGE     VERSION               INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                      KERNEL-VERSION                    CONTAINER-RUNTIME
ip-12-0-11-88.ap-northeast-2.compute.internal    Ready    <none>   6h51m   v1.34.2-eks-ecaa3a6   12.0.11.88    <none>        Amazon Linux 2023.10.20260120  6.12.64-87.122.amzn2023.x86_64   containerd://2.1.5
ip-12-0-13-242.ap-northeast-2.compute.internal   Ready    <none>   6h51m   v1.34.2-eks-ecaa3a6   12.0.13.242   <none>        Amazon Linux 2023.10.20260120  6.12.64-87.122.amzn2023.x86_64   containerd://2.1.5
```

### Demo 3: Check Pod Status in Specific Namespace

**Objective:** Monitor pods in the default namespace

#### Command:
```bash
kubectl --context="eks-bastion" get pods -n default -w
```

#### Output:
```
NAME                     READY   STATUS    RESTARTS   AGE
nginx-7c5d8bf9f7-7hkz5   1/1     Running   0          5m
```

### Demo 4: Describe a Pod

**Objective:** Get detailed information about a specific pod

#### Command:
```bash
kubectl --context="eks-bastion" describe pod nginx-7c5d8bf9f7-7hkz5 -n default
```

### Demo 5: View Pod Logs

**Objective:** Inspect logs from a running pod

#### Command:
```bash
kubectl --context="eks-bastion" logs nginx-7c5d8bf9f7-7hkz5 -n default
```

---

## Troubleshooting

### Issue 1: "context was not found for specified context: Shared-cluster"

**Cause:** The kubeconfig doesn't have a context named "Shared-cluster"

**Solution:**
1. Check available contexts:
   ```bash
   kubectl config get-contexts
   ```
2. Use the correct context name (e.g., `eks-bastion`):
   ```bash
   kubectl --context="eks-bastion" get nodes
   ```
3. If context doesn't exist, update kubeconfig:
   ```bash
   aws eks update-kubeconfig --region ap-northeast-2 --name Shared-cluster
   ```

### Issue 2: "Unable to connect to the server"

**Cause:** No network connectivity to the EKS cluster

**Solution:**
1. Verify AWS credentials are configured:
   ```bash
   aws sts get-caller-identity
   ```
2. Check if cluster is running and accessible
3. Verify security groups allow your IP to access the cluster

### Issue 3: "Permission denied" errors

**Cause:** AWS user/role doesn't have permissions for the cluster

**Solution:**
1. Verify IAM permissions for EKS access
2. Check if user is in the cluster's aws-auth ConfigMap:
   ```bash
   kubectl --context="eks-bastion" get configmap -n kube-system aws-auth -o yaml
   ```

### Issue 4: Pod in CrashLoopBackOff status

**Cause:** Application inside the pod is crashing on startup

**Solution:**
1. Check pod logs:
   ```bash
   kubectl --context="eks-bastion" logs <pod-name> -n <namespace>
   ```
2. Describe the pod:
   ```bash
   kubectl --context="eks-bastion" describe pod <pod-name> -n <namespace>
   ```
3. Check image is correct:
   ```bash
   kubectl --context="eks-bastion" get pod <pod-name> -n <namespace> -o yaml | grep image
   ```
4. Fix the issue (e.g., correct the image name):
   ```bash
   kubectl --context="eks-bastion" set image deployment/<deployment-name> <container-name>=<correct-image> -n <namespace>
   ```

### Issue 5: ImagePullBackOff error

**Cause:** Container image cannot be pulled from the registry

**Solution:**
1. Verify the image exists and is spelled correctly:
   ```bash
   docker pull <image-name>
   ```
2. Check if using private registry, ensure imagePullSecrets are configured
3. Update the deployment with correct image:
   ```bash
   kubectl --context="eks-bastion" set image deployment/<deployment-name> <container-name>=<correct-image> -n <namespace>
   ```

---

## Full Workflow Example

### Scenario: Deploy nginx and fix a failing pod

#### Step 1: List current pods
```bash
kubectl --context="eks-bastion" get pods -n default
```

#### Step 2: Check pod status
```bash
kubectl --context="eks-bastion" get pods --all-namespaces | findstr "CrashLoopBackOff"
```

#### Step 3: Describe the failing pod
```bash
kubectl --context="eks-bastion" describe pod nginx-66686b6766-tdzrb -n default
```

#### Step 4: Check pod logs
```bash
kubectl --context="eks-bastion" logs nginx-66686b6766-tdzrb -n default --tail=50
```

#### Step 5: Fix the issue (e.g., update the image)
```bash
kubectl --context="eks-bastion" set image deployment/nginx nginx=nginx:latest -n default
```

#### Step 6: Monitor pod restart
```bash
kubectl --context="eks-bastion" get pods -n default -w
```

#### Step 7: Verify pod is running
```bash
kubectl --context="eks-bastion" get pods -n default
```

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `kubectl config get-contexts` | List all kubeconfig contexts |
| `kubectl config use-context <context>` | Switch to a context |
| `kubectl get nodes` | List all cluster nodes |
| `kubectl get nodes -o wide` | List nodes with detailed info |
| `kubectl get pods --all-namespaces` | List all pods across namespaces |
| `kubectl get pods -n <namespace>` | List pods in specific namespace |
| `kubectl describe pod <pod-name> -n <namespace>` | Get detailed pod info |
| `kubectl logs <pod-name> -n <namespace>` | View pod logs |
| `kubectl logs <pod-name> -n <namespace> --tail=50` | View last 50 lines of logs |
| `kubectl get pods -n <namespace> -w` | Watch pods for changes |
| `kubectl set image deployment/<name> <container>=<image> -n <namespace>` | Update pod image |

---

## Next Steps

1. **Extend the Server:** Add more tools to interact with deployments, services, etc.
2. **Production Deployment:** Configure the server for production use with proper authentication and error handling
3. **Integration:** Connect the server to your MCP client for AI-assisted Kubernetes management

---

## References

- [Model Context Protocol Documentation](https://github.com/modelcontextprotocol/specification)
- [Kubernetes Python Client](https://github.com/kubernetes-client/python)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [kubectl Documentation](https://kubernetes.io/docs/reference/kubectl/)

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
