//
//  MakerViewModel.swift
//  MonsterMaker
//
//  Created by Hao Fu on 5/11/2022.
//

import Foundation
import FCL
import UIKit

class MakerViewModel: ViewModel {
    @Published
    private(set) var state: MakerPage.ViewState = .init()
    
    func trigger(_ input: MakerPage.Action) {
        switch input {
        case let .updateIndex(index, position):
            updateSelection(index: index, position: position)
        case .mint:
            mintNFT()
        case .buy:
            buyNFT()
        }
    }
    
    private func buyNFT() {
        guard let user = fcl.currentUser else {
            return
        }
        
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        
        Task {
            do {
                state.isMiniting = true
                let txId = try await fcl.mutate(cadence: MonsterMakerCadence.mintMonster,
                                                args: [
                                                .int(state.components.background),
                                                .int(state.components.head),
                                                .int(state.components.torso),
                                                .int(state.components.legs)
                                               ],
                                                gasLimit: 999,
                                                authorizors: [user, MinterHelper.shared])
                state.isMiniting = false
                print("txId ==> \(txId)")
                FlowManager.shared.subscribeTransaction(txId: txId.hex)
            } catch {
                state.isMiniting = false
                print(error)
            }
        }
    }
    
    private func mintNFT() {
        guard let user = fcl.currentUser else {
            return
        }
        
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        
        Task {
            do {
                state.isMiniting = true
                let request = MintRequest(address: user.addr.hex, components: state.components)
                let response: MintResponse = try await Network.request(NFTEndpoint.mint(request))
                print("txId ==> \(response.txId)")
                FlowManager.shared.subscribeTransaction(txId: response.txId)
            } catch {
                state.isMiniting = false
                print(error)
            }
        }
    }
    
    private func updateSelection(index: Int, position: NFTComponent) {
        Task { @MainActor in
            switch position {
            case .background:
                self.state.components.background = index
            case .legs:
                self.state.components.legs = index
            case .head:
                self.state.components.head = index
            case .torso:
                self.state.components.torso = index
            }
            
        }
    }
}
