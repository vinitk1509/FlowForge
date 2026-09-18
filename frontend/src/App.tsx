import { useState, useCallback, useRef, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import type {
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './components/nodes/TriggerNode';
import { ActionNode } from './components/nodes/ActionNode';
import { LogicNode } from './components/nodes/LogicNode';
import { DataNode } from './components/nodes/DataNode';
import { Header } from './components/Header';
import { NodePalette } from './components/NodePalette';
import { NodeInspector } from './components/NodeInspector';
import { ExecutionConsole } from './components/ExecutionConsole';
import { DagValidationModal } from './components/DagValidationModal';
import { TemplatesModal } from './components/TemplatesModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { Dashboard } from './components/dashboard/Dashboard';

import { DEMO_TEMPLATES } from './utils/demoWorkflows';
import type { WorkflowTemplate } from './utils/demoWorkflows';
import { validateDag } from './utils/dagValidator';
import { sounds } from './utils/soundEffects';
import { AuthService, DEMO_USER } from './services/api';
import type { UserProfile, AuthSession } from './types/auth';
import type {
  WorkflowNodeData,
  ValidationResult,
  ExecutionSummary,
  ExecutionLogEntry,
  NodeType,
} from './types/workflow';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  logicNode: LogicNode,
  dataNode: DataNode,
};

export default function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node<WorkflowNodeData>, Edge> | null>(null);

  // App View Routing & Auth State
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD' | 'STUDIO'>('LANDING');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => AuthService.getSession()?.user || null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Initial template: Architecture Document Base Demo Workflow
  const [workflowName, setWorkflowName] = useState<string>(DEMO_TEMPLATES[0].name);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(DEMO_TEMPLATES[0].nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(DEMO_TEMPLATES[0].edges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modals & Drawers
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [executionSummary, setExecutionSummary] = useState<ExecutionSummary | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Connecting edges
  const onConnect = useCallback(
    (params: Connection) => {
      sounds.playConnect();
      const isTrueBranch = params.sourceHandle === 'true';
      const isFalseBranch = params.sourceHandle === 'false';

      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.sourceHandle || 'def'}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: isTrueBranch ? '#10b981' : isFalseBranch ? '#f43f5e' : '#06b6d4',
          strokeWidth: isTrueBranch ? 2.5 : 2,
        },
        label: isTrueBranch ? 'TRUE' : isFalseBranch ? 'FALSE' : undefined,
        labelStyle: isTrueBranch
          ? { fill: '#10b981', fontWeight: 700, fontSize: 11 }
          : isFalseBranch
          ? { fill: '#f43f5e', fontWeight: 700, fontSize: 11 }
          : undefined,
        labelBgStyle: isTrueBranch
          ? { fill: '#0a1612', fillOpacity: 0.9, stroke: '#10b981', rx: 6 }
          : isFalseBranch
          ? { fill: '#1f0d14', fillOpacity: 0.9, stroke: '#f43f5e', rx: 6 }
          : undefined,
      };

      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    sounds.playClick();
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Drag and Drop from NodePalette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const item = JSON.parse(rawData);
      sounds.playClick();

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<WorkflowNodeData> = {
        id: `node-${item.type.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        type: item.reactFlowType,
        position,
        data: {
          label: item.name,
          name: item.name,
          type: item.type as NodeType,
          category: item.category,
          description: item.description,
          config: item.defaultConfig,
          status: 'PENDING',
        },
      };

      setNodes(nds => nds.concat(newNode));
      setSelectedNodeId(newNode.id);
    },
    [reactFlowInstance, setNodes]
  );

  // Add node from clicking the '+' in palette
  const handleAddNodeFromPalette = (item: {
    type: NodeType;
    reactFlowType: string;
    category: WorkflowNodeData['category'];
    name: string;
    description: string;
    defaultConfig: Record<string, unknown>;
  }) => {
    sounds.playClick();
    const position = {
      x: 300 + Math.random() * 200,
      y: 150 + Math.random() * 200,
    };

    const newNode: Node<WorkflowNodeData> = {
      id: `node-${item.type.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      type: item.reactFlowType,
      position,
      data: {
        label: item.name,
        name: item.name,
        type: item.type,
        category: item.category,
        description: item.description,
        config: item.defaultConfig,
        status: 'PENDING',
      },
    };

    setNodes(nds => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
  };

  // Node Mutations
  const handleUpdateNodeData = (id: string, partialData: Partial<WorkflowNodeData>) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...partialData,
            },
          };
        }
        return node;
      })
    );
  };

  const handleDeleteNode = (id: string) => {
    sounds.playClick();
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleDuplicateNode = (node: Node<WorkflowNodeData>) => {
    sounds.playClick();
    const duplicatedNode: Node<WorkflowNodeData> = {
      ...node,
      id: `${node.id}-copy-${Date.now().toString().slice(-3)}`,
      position: {
        x: node.position.x + 30,
        y: node.position.y + 30,
      },
      data: {
        ...node.data,
        name: `${node.data.name} (Copy)`,
        status: 'PENDING',
      },
    };
    setNodes(nds => nds.concat(duplicatedNode));
    setSelectedNodeId(duplicatedNode.id);
  };

  // DAG Validation
  const handleValidateDag = () => {
    const res = validateDag(nodes, edges);
    setValidationResult(res);
    setIsValidateModalOpen(true);
    if (res.valid) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  // Template Switching
  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setWorkflowName(template.name);
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(null);
    setExecutionSummary(null);
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.2 });
    }, 100);
  };

  // Export JSON (Matches backend WorkflowGraph schema)
  const handleExportJson = () => {
    sounds.playClick();
    const exportGraph = {
      name: workflowName,
      exportedAt: new Date().toISOString(),
      nodes: nodes.map(n => ({
        id: n.id,
        name: n.data.name,
        type: n.data.type,
        category: n.data.category,
        position: n.position,
        config: n.data.config,
        credentialsRef: n.data.credentialsRef,
      })),
      edges: edges.map(e => ({
        id: e.id,
        sourceNodeId: e.source,
        targetNodeId: e.target,
        sourceHandle: e.sourceHandle || 'default',
        targetHandle: e.targetHandle || 'default',
      })),
    };

    const blob = new Blob([JSON.stringify(exportGraph, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Authentication Handlers
  const handleAuthSuccess = (session: AuthSession) => {
    setCurrentUser(session.user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    sounds.playClick();
    AuthService.clearSession();
    setCurrentUser(null);
    setCurrentView('LANDING');
  };

  // Dashboard Workflow Navigation
  const handleOpenWorkflowInStudio = (_workflowId: string) => {
    // Default load template 0
    handleSelectTemplate(DEMO_TEMPLATES[0]);
    setCurrentView('STUDIO');
  };

  const handleInstantiateTemplate = (template: WorkflowTemplate) => {
    handleSelectTemplate(template);
    setCurrentView('STUDIO');
  };

  const handleCreateBlankWorkflow = () => {
    setWorkflowName('Untitled Workflow');
    const blankTrigger: Node<WorkflowNodeData> = {
      id: 'trigger-1',
      type: 'triggerNode',
      position: { x: 200, y: 200 },
      data: {
        label: 'Webhook Trigger',
        name: 'Webhook Trigger',
        type: 'TRIGGER_WEBHOOK',
        category: 'TRIGGER',
        description: 'Receives external webhook requests',
        status: 'READY',
        config: { webhookPath: '/webhooks/v1/custom' },
      },
    };
    setNodes([blankTrigger]);
    setEdges([]);
    setSelectedNodeId(blankTrigger.id);
    setExecutionSummary(null);
    setCurrentView('STUDIO');
  };

  // Interactive Execution Simulation Engine
  const runSimulation = async () => {
    const val = validateDag(nodes, edges);
    if (!val.valid) {
      setValidationResult(val);
      setIsValidateModalOpen(true);
      sounds.playError();
      return;
    }

    setIsSimulating(true);
    setIsConsoleOpen(true);

    const execId = `exec-${Date.now().toString(36)}`;
    const startTime = Date.now();
    const logs: ExecutionLogEntry[] = [];

    // Reset all node statuses to PENDING
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'PENDING', activeBranch: undefined } })));

    // Find trigger node
    const triggerNode = nodes.find(n => n.data.category === 'TRIGGER');
    if (!triggerNode) {
      setIsSimulating(false);
      return;
    }

    let currentNodeId: string | null = triggerNode.id;
    let currentPayload: Record<string, unknown> = {
      event: 'payment_intent.succeeded',
      amount: 15400,
      currency: 'USD',
      customer: { email: 'enterprise@apexcorp.com', tier: 'ENTERPRISE' },
      orderId: 'ORD-90412',
    };

    while (currentNodeId) {
      const nodeToExecute = nodes.find(n => n.id === currentNodeId);
      if (!nodeToExecute) break;

      // Mark running
      const runningNodeId: string = currentNodeId;
      setNodes(nds =>
        nds.map(n => (n.id === runningNodeId ? { ...n, data: { ...n.data, status: 'RUNNING' } } : n))
      );
      sounds.playStepRun();

      // Delay for realistic visual execution progress
      await new Promise(r => setTimeout(r, 600));

      const duration = Math.floor(Math.random() * 35) + 20;
      let activeBranch: 'true' | 'false' | 'default' = 'default';
      let stepOutput: Record<string, unknown> = { ...currentPayload };

      if (nodeToExecute.data.type === 'DATA_TRANSFORM') {
        stepOutput = {
          orderId: currentPayload.orderId,
          amount: currentPayload.amount,
          email: 'enterprise@apexcorp.com',
          isHighValue: Number(currentPayload.amount) >= 10000,
        };
      } else if (nodeToExecute.data.type === 'ACTION_HTTP') {
        stepOutput = {
          riskScore: 0.02,
          status: 'VERIFIED',
          customerEmail: currentPayload.email,
          verifiedAt: new Date().toISOString(),
        };
      } else if (nodeToExecute.data.type === 'LOGIC_IF') {
        const amount = Number(currentPayload.amount || 15400);
        const conditionPasses = amount > 10000;
        activeBranch = conditionPasses ? 'true' : 'false';
        stepOutput = {
          condition: '$json.amount > 10000',
          evaluated: conditionPasses,
          selectedBranch: activeBranch.toUpperCase(),
        };
      } else if (nodeToExecute.data.type === 'ACTION_SLACK') {
        stepOutput = {
          sent: true,
          channel: '#vip-sales-alerts',
          messageId: `msg_${Date.now().toString(36)}`,
        };
      } else if (nodeToExecute.data.type === 'ACTION_EMAIL') {
        stepOutput = {
          dispatched: true,
          recipient: currentPayload.email,
          delivered: true,
        };
      }

      currentPayload = { ...currentPayload, ...stepOutput };

      // Mark Succeeded
      setNodes(nds =>
        nds.map(n =>
          n.id === runningNodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: 'SUCCEEDED',
                  lastRunDurationMs: duration,
                  lastOutput: stepOutput,
                  activeBranch,
                },
              }
            : n
        )
      );

      logs.push({
        nodeId: nodeToExecute.id,
        nodeName: nodeToExecute.data.name,
        nodeType: nodeToExecute.data.type,
        status: 'SUCCEEDED',
        durationMs: duration,
        timestamp: new Date().toLocaleTimeString(),
        inputPayload: currentPayload,
        outputPayload: stepOutput,
      });

      setExecutionSummary({
        executionId: execId,
        status: 'RUNNING',
        startTime,
        logs: [...logs],
      });

      // Advance along outgoing edge
      const outgoingEdges: Edge[] = edges.filter((e: Edge) => e.source === runningNodeId);
      if (outgoingEdges.length === 0) {
        currentNodeId = null;
      } else if (nodeToExecute.data.type === 'LOGIC_IF') {
        // Follow specifically the evaluated branch handle!
        const matchingEdge: Edge | undefined = outgoingEdges.find((e: Edge) => e.sourceHandle === activeBranch);
        currentNodeId = matchingEdge ? matchingEdge.target : null;
      } else {
        currentNodeId = outgoingEdges[0].target;
      }
    }

    const totalDuration = Date.now() - startTime;
    setExecutionSummary({
      executionId: execId,
      status: 'SUCCEEDED',
      startTime,
      endTime: Date.now(),
      totalDurationMs: totalDuration,
      logs,
    });

    setIsSimulating(false);
    sounds.playSuccess();
  };

  // Handle URL hash changes to automatically bring up the one-page Landing view
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#features' || hash === '#architecture' || hash === '#blueprints') {
        setCurrentView('LANDING');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <ThemeProvider>
      {/* 1. LANDING PAGE VIEW */}
      {currentView === 'LANDING' && (
        <LandingPage
          onOpenAuth={mode => {
            sounds.playClick();
            setAuthModalMode(mode || 'LOGIN');
            setAuthModalOpen(true);
          }}
          onEnterStudio={(template?: WorkflowTemplate) => {
            sounds.playClick();
            if (template) {
              setWorkflowName(template.name);
              setNodes(template.nodes);
              setEdges(template.edges);
              setSelectedNodeId(null);
            }
            setCurrentView('STUDIO');
          }}
          onOpenDashboard={() => {
            sounds.playClick();
            setCurrentView('DASHBOARD');
          }}
          isLoggedIn={!!currentUser}
        />
      )}

      {/* 2. DASHBOARD VIEW */}
      {currentView === 'DASHBOARD' && (
        <Dashboard
          user={currentUser || DEMO_USER}
          onLogout={handleLogout}
          onOpenWorkflowInStudio={handleOpenWorkflowInStudio}
          onInstantiateTemplate={handleInstantiateTemplate}
          onCreateBlankWorkflow={handleCreateBlankWorkflow}
        />
      )}

      {/* 3. STUDIO CANVAS VIEW */}
      {currentView === 'STUDIO' && (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Studio Header */}
          <Header
            workflowName={workflowName}
            onRenameWorkflow={setWorkflowName}
            onSimulate={runSimulation}
            isSimulating={isSimulating}
            onValidate={handleValidateDag}
            isActive={isActive}
            onToggleActive={() => setIsActive(!isActive)}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onExportJson={handleExportJson}
            nodeCount={nodes.length}
            edgeCount={edges.length}
            onBackToDashboard={() => {
              sounds.playClick();
              setCurrentView('DASHBOARD');
            }}
          />

          {/* Main Studio Body: Palette + Canvas + Inspector */}
          <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
            {/* Left: Node Palette */}
            <NodePalette onAddNode={handleAddNodeFromPalette} />

            {/* Center Canvas */}
            <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: true,
                }}
              >
                <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
                <Controls showInteractive={false} />
                <MiniMap
                  nodeStrokeColor="#06b6d4"
                  nodeColor="#192336"
                  maskColor="rgba(7, 9, 14, 0.75)"
                  zoomable
                  pannable
                />
              </ReactFlow>

              {/* Bottom Execution Console */}
              <ExecutionConsole
                execution={executionSummary}
                isOpen={isConsoleOpen}
                onToggleOpen={() => setIsConsoleOpen(!isConsoleOpen)}
                onClose={() => setIsConsoleOpen(false)}
                onRerun={runSimulation}
              />
            </div>

            {/* Right Inspector Drawer */}
            <NodeInspector
              selectedNode={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onUpdateNodeData={handleUpdateNodeData}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
            />
          </div>

          {/* DAG Validation Diagnostic Modal */}
          <DagValidationModal
            result={validationResult}
            isOpen={isValidateModalOpen}
            onClose={() => setIsValidateModalOpen(false)}
          />

          {/* Blueprint Templates Modal */}
          <TemplatesModal
            isOpen={isTemplatesModalOpen}
            onClose={() => setIsTemplatesModalOpen(false)}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </ThemeProvider>
  );
}
