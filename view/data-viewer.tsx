import { faker } from '@faker-js/faker'
import { JsonViewer } from '@textea/json-viewer'
import React from 'react'
import { Virtuoso } from 'react-virtuoso'
import { ViewState } from '.'
import { ExportedSimulator } from '../pkg'

export const DataViewer = ({
  simulator,
  state,
  style,
  onUpdate,
}: {
  simulator: ExportedSimulator
  state: ViewState
  style?: React.CSSProperties
  onUpdate?: (id: string, k: string, v: string) => void
}) => {
  return (
    <Virtuoso
      style={style}
      totalCount={state.clients.length}
      itemContent={(index) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: 200 }}>
          <button onClick={() => onUpdate?.(state.clients[index].id, faker.word.noun(), faker.word.noun())}>
            Add random key-value
          </button>
          <JsonViewer
            editable
            onChange={([k], _, v) => onUpdate?.(state.clients[index].id, k.toString(), v + '')}
            value={Object.fromEntries(simulator.debug_client(state.clients[index].id).entries())}
            style={{ flex: '1' }}
          />
        </div>
      )}
    />
  )
}
