import { JsonViewer } from '@textea/json-viewer'
import React from 'react'
import { Virtuoso } from 'react-virtuoso'
import { ViewState } from '.'
import { ExportedSimulator } from '../pkg'

export const DataViewer = ({
  simulator,
  state,
  style,
  onClickAdd,
}: {
  simulator: ExportedSimulator
  state: ViewState
  style?: React.CSSProperties
  onClickAdd?: (id: string) => void
  onUpdate?: (id: string, k: string, v: string) => void
}) => {
  return (
    <Virtuoso
      style={style}
      totalCount={state.clients.length}
      itemContent={(index) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: 200 }}>
          <button onClick={() => onClickAdd?.(state.clients[index].id)}>
            Add random key-value
          </button>
          <JsonViewer
            editable
            onChange={console.log}
            value={simulator.debug_client(state.clients[index].id)}
            style={{ flex: '1' }}
          />
        </div>
      )}
    />
  )
}
